const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      // getting headers data to validate
      const { data } = request.payload;
      console.log(data.hapi.headers);
      this._validator.validateImageHeaders(data.hapi.headers);
      console.log('berhasil ke sini');
      const filename = await this._service.writeFile(data, data.hapi);
      console.log('dapet filename');

      const response = h.response({
        status: 'success',
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!!
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kesalahan pada server kami.',
      });
      response.code(500);
      console.log(error);
      return response;
    }
  }
}

module.exports = UploadsHandler;
