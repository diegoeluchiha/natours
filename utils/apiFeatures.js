class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A-Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B- Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //  let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this; //o su equivalente
  }

  sort() {
    //2-sorting
    if (this.queryString.sort) {
      // console.log(this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('_id');
    }
    return this;
  }

  limitFields() {
    //3-fields
    // console.log(req.query.fields);
    if (this.queryString.fields) {
      const blockedFields = ['__v', 'password'];
      const fields = this.queryString.fields
        .split(',')
        .filter((el) => {
          return !blockedFields.includes(el);
        })
        .join(' ');

      if (fields) {
        this.query = this.query.select(fields);
      } else {
        // Si el usuario pidió solo campos bloqueados
        this.query = this.query.select('-__v -password');
      }
    } else {
      this.query = this.query.select('-__v -password');
    }
    return this; //devolver this pra poder encadenar
  }

  paginate() {
    //4-pagination
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
