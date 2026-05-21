const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

class FirestoreCollection {
  constructor(name) {
    this.name = name;
    this.ref = db.collection(name);
  }

  async findAll(options = {}) {
    let query = this.ref;
    if (options.where) {
      for (const [field, val] of Object.entries(options.where)) {
        if (val && typeof val === 'object' && val !== null && !Array.isArray(val)) {
          for (const [op, v] of Object.entries(val)) {
            if (op === 'like') {
              const start = v.replace(/%/g, '');
              query = query.where(field, '>=', start)
                .where(field, '<=', start + '\uf8ff');
            } else if (op === 'in') {
              query = query.where(field, 'in', Array.isArray(v) ? v : [v]);
            } else if (op === 'ne') {
              query = query.where(field, '!=', v);
            } else if (op === 'gte') {
              query = query.where(field, '>=', v);
            } else if (op === 'lte') {
              query = query.where(field, '<=', v);
            } else if (op === 'gt') {
              query = query.where(field, '>', v);
            } else if (op === 'lt') {
              query = query.where(field, '<', v);
            }
          }
        } else {
          query = query.where(field, '==', val);
        }
      }
    }
    if (options.order) {
      for (const [field, dir] of Object.entries(options.order)) {
        query = query.orderBy(field, dir === 'DESC' ? 'desc' : 'asc');
      }
    }
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.offset(options.offset);
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async create(data) {
    const docRef = await this.ref.add(data);
    const doc = await docRef.get();
    return { id: docRef.id, ...doc.data() };
  }

  async findByPk(id) {
    const doc = await this.ref.doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findOne(options = {}) {
    const results = await this.findAll({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async update(id, data) {
    await this.ref.doc(String(id)).update(data);
    const doc = await this.ref.doc(String(id)).get();
    return { id: doc.id, ...doc.data() };
  }

  async destroy(id) {
    await this.ref.doc(String(id)).delete();
    return true;
  }

  async count(options = {}) {
    const results = await this.findAll(options);
    return results.length;
  }

  async findOrCreate(where, defaults) {
    const existing = await this.findOne({ where });
    if (existing) return [existing, false];
    const created = await this.create({ ...where, ...defaults });
    return [created, true];
  }

  async bulkCreate(items) {
    const batch = db.batch();
    const refs = items.map(item => this.ref.doc());
    refs.forEach((ref, i) => batch.set(ref, items[i]));
    await batch.commit();
    const snapshots = await Promise.all(refs.map(r => r.get()));
    return snapshots.map((s, i) => ({ id: s.id, ...s.data() }));
  }

  async raw(query) {
    const snap = await this.ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

const collections = {
  User: new FirestoreCollection('users'),
  Student: new FirestoreCollection('students'),
  Teacher: new FirestoreCollection('teachers'),
  Class: new FirestoreCollection('classes'),
  Subject: new FirestoreCollection('subjects'),
  AcademicYear: new FirestoreCollection('academicYears'),
  Attendance: new FirestoreCollection('attendance'),
  Grade: new FirestoreCollection('grades'),
  Dormitory: new FirestoreCollection('dormitories'),
  Room: new FirestoreCollection('rooms'),
  RoomAssignment: new FirestoreCollection('roomAssignments'),
  Exam: new FirestoreCollection('exams'),
  ExamResult: new FirestoreCollection('examResults'),
};

module.exports = { db, collections };
