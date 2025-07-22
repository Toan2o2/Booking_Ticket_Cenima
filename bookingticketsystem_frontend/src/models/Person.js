export class Person {
  constructor(data = {}) {
    this.personId = data.personId || null;
    this.name = data.name || '';
    this.dateOfBirth = data.dateOfBirth || null;
    this.biography = data.biography || '';
    this.nationality = data.nationality || '';
    this.photoUrl = data.photoUrl || '';
    this.role = data.role || '';
  }

  static fromApi(data) {
    return new Person({
      personId: data.personId || data.id,
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      biography: data.biography,
      nationality: data.nationality,
      photoUrl: data.photoUrl,
      role: data.role
    });
  }

  toCreateUpdateDto() {
    return {
      Name: this.name,
      DateOfBirth: this.dateOfBirth ? (typeof this.dateOfBirth === 'string' ? this.dateOfBirth : this.dateOfBirth.toISOString().split('T')[0]) : '',
      Biography: this.biography,
      Nationality: this.nationality,
      Role: this.role
    };
  }
} 