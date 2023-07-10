/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */

const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      // validate payload
      this._validator.validatePostAuthenticationPayload(request.payload);

      // destructuring object dari request payload
      const { username, password } = request.payload;

      // verify user credential that return back id
      const id = await this._usersService.verifyUserCredential(
        username,
        password
      );

      // jika verify user credential lolos lanjut generate access token dan refresh token
      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      // simpan refresh token di database
      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
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

      // jika SERVER ERROR!!
      const response = h.response({
        status: 'fail',
        message: 'Maaf. terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      // validate refresh token sebelumnya
      this._validator.validatePutAuthenticationPayload(request.payload);

      // jika sudah tervalidasi maka kemudian ambil refresh token
      const { refreshToken } = request.payload;

      // kemudian verify di database untuk nilai refresh tokenya
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      // verify juga refresh token dengan token manager
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      // setelah itu credential id yang didapatkan dari token manager saat verify
      // akan digunakan untuk membuat access token yang baru
      const accessToken = this._tokenManager.generateAccessToken({ id });
      return {
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // if server error
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AuthenticationsHandler;
