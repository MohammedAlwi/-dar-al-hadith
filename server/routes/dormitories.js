const express = require('express');
const router = express.Router();
const { Dormitory, Room } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const dormitories = await Dormitory.findAll({ include: [{ model: Room }] });
    res.json(dormitories);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const dormitory = await Dormitory.create(req.body);
    res.status(201).json(dormitory);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const dormitory = await Dormitory.findByPk(req.params.id);
    if (!dormitory) return res.status(404).json({ message: 'المبنى غير موجود' });
    await dormitory.update(req.body);
    res.json(dormitory);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const dormitory = await Dormitory.findByPk(req.params.id);
    if (!dormitory) return res.status(404).json({ message: 'المبنى غير موجود' });
    await dormitory.destroy();
    res.json({ message: 'تم حذف المبنى بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
