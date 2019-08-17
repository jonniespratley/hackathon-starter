const { RESTDataSource } = require('apollo-datasource-rest');


class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  get baseURL() {
    if (this.context.env === 'development') {
      return 'https://movies-api-dev.example.com/';
    } 
      return 'https://movies-api.example.com/';
    
  }

  /* async resolveURL(request) {
    if (!this.baseURL) {
      const addresses = await resolveSrv(`${request.path.split("/")[1]  }.service.consul`);
      this.baseURL = addresses[0];
    }
    return super.resolveURL(request);
  }
  */

  // an example making an HTTP POST request
  async postMovie(movie) {
    return this.post(`movies`, // path
      movie, // request body
    );
  }

  // an example making an HTTP PUT request
  async newMovie(movie) {
    return this.put(`movies`, // path
      movie, // request body
    );
  }

  // an example making an HTTP PATCH request
  async updateMovie(movie) {
    return this.patch(`movies`, // path
      { id: movie.id, movie }, // request body
    );
  }

  // an example making an HTTP DELETE request
  async deleteMovie(movie) {
    return this.delete(`movies/${movie.id}`, // path
    );
  }
}
module.exports = MoviesAPI;