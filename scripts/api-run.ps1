# Chay: powershell -File scripts\api-run.ps1   (he thong dang chay: docker compose up -d)
# Ket qua day du (status + header + body) ghi vao api-run-output.txt de dan vao docs/api-docs.md.
# LUU Y: script tao du lieu moi (khach, phieu) va duyet bao hanh phieu 3 => sau khi chay xong
# hay chay: docker compose down -v ; docker compose up -d --build  de tra du lieu mau ve ban dau.

$base = "http://localhost:3000"
$out  = "api-run-output.txt"
"" | Set-Content $out -Encoding utf8

function Call($label, $method, $path, $token, $body) {
  $a = @("-s", "-i", "-X", $method, "$base$path")
  if ($token) { $a += @("-H", "Authorization: Bearer $token") }
  if ($body) {
    $tmp = [IO.Path]::GetTempFileName()
    [IO.File]::WriteAllText($tmp, $body, (New-Object Text.UTF8Encoding $false))
    $a += @("-H", "Content-Type: application/json", "--data-binary", "@$tmp")
  }
  $res = (& curl.exe @a) -join "`n"
  Add-Content $out -Encoding utf8 ("### $label`n$method $path`n$res`n")
  Write-Host "done: $label"
  return $res
}
function BodyOf($res) { return ($res -replace "(?s)^.*?\r?\n\r?\n", "") }
function Id($json, $name) {
  $o = $json | ConvertFrom-Json
  if ($o.$name) { return $o.$name }
  if ($o.data -and $o.data.$name) { return $o.data.$name }
  return $null
}

# 1, 2: health + login
Call "01 health" GET "/api/health" $null $null | Out-Null
$r = Call "02 login nv1" POST "/api/auth/login" $null '{"username":"nv1","password":"Mekong@123"}'
$nv = (BodyOf $r | ConvertFrom-Json).token
$r = Call "02 login ql1" POST "/api/auth/login" $null '{"username":"ql1","password":"Mekong@123"}'
$ql = (BodyOf $r | ConvertFrom-Json).token
Call "02 login sai mat khau" POST "/api/auth/login" $null '{"username":"nv1","password":"sai"}' | Out-Null
Call "02 khong co token" GET "/api/tickets" $null $null | Out-Null

# 3: tra cuu khach
Call "03 customers lookup" GET "/api/customers?phone=0901234567" $nv $null | Out-Null

# 4: tao khach (SDT ngau nhien de khong trung)
$phone = "09" + (Get-Random -Minimum 10000000 -Maximum 99999999)
$r = Call "04 customers create" POST "/api/customers" $nv ('{"full_name":"Khach Thu API","phone":"' + $phone + '","email":"thu@example.com"}')
$cid = Id (BodyOf $r) "customer_id"
Call "04 customers create trung SDT" POST "/api/customers" $nv ('{"full_name":"Khach Thu API","phone":"' + $phone + '"}') | Out-Null
Call "04 customers create thieu ten" POST "/api/customers" $nv '{"phone":"0912345670"}' | Out-Null

# 5, 6: xem + sua khach (thu ca nv va ql de biet vai tro nao goi duoc)
if ($cid) {
  Call "05 customers get nv" GET "/api/customers/$cid" $nv $null | Out-Null
  Call "05 customers get ql" GET "/api/customers/$cid" $ql $null | Out-Null
  Call "05 customers get id sai" GET "/api/customers/abc" $nv $null | Out-Null
  Call "05 customers get khong ton tai" GET "/api/customers/999999" $nv $null | Out-Null
  Call "06 customers patch nv" PATCH "/api/customers/$cid" $nv '{"full_name":"Khach Thu API (sua)"}' | Out-Null
  Call "06 customers patch ql" PATCH "/api/customers/$cid" $ql '{"email":"sua@example.com"}' | Out-Null
  Call "06 customers patch body rong" PATCH "/api/customers/$cid" $nv '{}' | Out-Null
  Call "07 customers soft-delete nv" POST "/api/customers/$cid/soft-delete" $nv $null | Out-Null
  Call "07 customers soft-delete ql" POST "/api/customers/$cid/soft-delete" $ql $null | Out-Null
} else { Write-Host "Khong lay duoc customer_id: xem api-run-output.txt muc 04" }

# 8: danh sach phieu
Call "08 tickets list nv" GET "/api/tickets?page=1&size=2" $nv $null | Out-Null
Call "08 tickets list ql" GET "/api/tickets?page=1&size=2" $ql $null | Out-Null
Call "08 tickets cho duyet ql" GET "/api/tickets?warranty_verified=false" $ql $null | Out-Null
Call "08 tickets cho duyet nv" GET "/api/tickets?warranty_verified=false" $nv $null | Out-Null
Call "08 tickets warranty_verified=true" GET "/api/tickets?warranty_verified=true" $ql $null | Out-Null
Call "08 tickets size sai" GET "/api/tickets?size=0" $nv $null | Out-Null

# 9, 10, 11: tao / xem / sua phieu
$r = Call "09 tickets create" POST "/api/tickets" $nv '{"customer_id":1,"device_id":1,"issue_desc":"Man hinh soc ngang, cam ung kem"}'
$tid = Id (BodyOf $r) "ticket_id"
Call "09 tickets create 9 ky tu" POST "/api/tickets" $nv '{"customer_id":1,"device_id":1,"issue_desc":"aaaaaaaaa"}' | Out-Null
Call "09 tickets create thieu issue_desc" POST "/api/tickets" $nv '{"customer_id":1,"device_id":1}' | Out-Null
if ($tid) {
  Call "10 tickets get nv" GET "/api/tickets/$tid" $nv $null | Out-Null
  Call "10 tickets get ql" GET "/api/tickets/$tid" $ql $null | Out-Null
  Call "11 tickets patch nv" PATCH "/api/tickets/$tid" $nv '{"priority":"CAO"}' | Out-Null
  Call "11 tickets patch ql" PATCH "/api/tickets/$tid" $ql '{"priority":"THAP"}' | Out-Null
  Call "11 tickets patch priority sai" PATCH "/api/tickets/$tid" $nv '{"priority":"KHAN_CAP"}' | Out-Null
  Call "11 tickets patch body rong" PATCH "/api/tickets/$tid" $nv '{}' | Out-Null
  Call "13 status-log phieu moi ql" GET "/api/tickets/$tid/status-log" $ql $null | Out-Null
  Call "14 tickets soft-delete nv" POST "/api/tickets/$tid/soft-delete" $nv $null | Out-Null
  Call "14 tickets soft-delete ql" POST "/api/tickets/$tid/soft-delete" $ql $null | Out-Null
} else { Write-Host "Khong lay duoc ticket_id: xem api-run-output.txt muc 09" }
Call "10 tickets get khong ton tai" GET "/api/tickets/999999" $nv $null | Out-Null

# 12: duyet bao hanh (phieu 3: warranty_verified=false, trung tam 1) -- THAY DOI DU LIEU MAU
Call "12 approve nv (mong doi 403)" PATCH "/api/tickets/3/approve-warranty" $nv '{"is_warranty":true}' | Out-Null
Call "12 approve thieu is_warranty" PATCH "/api/tickets/3/approve-warranty" $ql '{}' | Out-Null
Call "12 approve ql lan 1" PATCH "/api/tickets/3/approve-warranty" $ql '{"is_warranty":true,"note":"Da kiem tra hoa don"}' | Out-Null
Call "12 approve ql lan 2 (mong doi 409)" PATCH "/api/tickets/3/approve-warranty" $ql '{"is_warranty":true}' | Out-Null

# 13: status-log phieu 3
Call "13 status-log ql" GET "/api/tickets/3/status-log?page=1&size=10" $ql $null | Out-Null
Call "13 status-log nv (mong doi 403)" GET "/api/tickets/3/status-log" $nv $null | Out-Null

# 15: nhom su co
Call "15 issue-categories" GET "/api/issue-categories" $nv $null | Out-Null

Write-Host "Xong. Mo api-run-output.txt de lay response that."
