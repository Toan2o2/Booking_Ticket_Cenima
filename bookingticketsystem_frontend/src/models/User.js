export class User {
  constructor(data = {}) {
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.loyaltyPoints = data.loyaltyPoints || 0;
    this.createdAt = data.createdAt || null;
    this.modifiedAt = data.modifiedAt || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  static fromApi(data) {
    return new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      loyaltyPoints: data.loyaltyPoints,
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt,
      isActive: data.isActive
    });
  }

  toCreateDto() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone
    };
  }

  toUpdateDto() {
    return {
      name: this.name,
      phone: this.phone
    };
  }
} 