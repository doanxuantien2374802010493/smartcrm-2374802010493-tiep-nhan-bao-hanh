const bcrypt = require('bcryptjs');
const { AppError } = require('../errors/AppError');

// Không biết HTTP; việc ký token do bên ngoài tiêm vào (signToken).
class AuthService {
  constructor(employeeRepo, signToken) {
    this.employeeRepo = employeeRepo;
    this.signToken = signToken;
  }

  async login({ username, password }) {
    const emp = await this.employeeRepo.findByUsername(username);
    // Cùng một thông báo cho "không có tài khoản" và "sai mật khẩu" để không lộ tài khoản nào tồn tại
    const ok = emp && emp.passwordHash && (await bcrypt.compare(password, emp.passwordHash));
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Tên đăng nhập hoặc mật khẩu không đúng');
    const user = { employeeId: emp.employeeId, fullName: emp.fullName, role: emp.role, centerId: emp.centerId };
    return { token: this.signToken(user), user };
  }
}

module.exports = AuthService;
