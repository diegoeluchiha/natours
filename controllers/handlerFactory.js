//facroy function deleteOne

const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return next(new AppError('Invalid tour ID', 400));
    // }
    const doc = await Model.findByIdAndDelete(id); //devuelve el tour eliminado
    // console.log('null', tour);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid ID', 400));
    }
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      // Devuelve el nuevo documento actualizado
      new: true, //activo la opcion new para que me devuleva el nuevo documento actualizado
      runValidators: true, // valida los datos
    });

    if (!doc) {
      return next(new AppError('doc not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res) => {
    //para permitir que los reviews anidados a los tours se puedan ver
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain(); //explain() me da un objeto con la consulta que se va a hacer a la base de datos
    const doc = await features.query; //ejecuta la consulta a la base de datos
    //nuestra consulkta se veria asi
    //query.sort().select().skip().limit()
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
