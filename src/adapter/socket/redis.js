'use strict';

let redis = require('redis');

module.exports = class extends think.adapter.socket {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    this.config = config;
    this.connection = null;
    this.deferred = null;
  }
  /**
   * connect redis
   * @return {Promise} []
   */
  connect(){
    if (this.connection) {
      return this.deferred.promise;
    }
    let deferred = think.defer();
    let connection = redis.createClient(this.config.port, this.config.host, this.config);
    if (this.config.password) {
      connection.auth(this.config.password, () => {});
    }
    connection.on('ready', () => {
      deferred.resolve();
    })
    connection.on('connect', () => {
      deferred.resolve();
    })
    connection.on('error', () => {
      self.close();
    })
    connection.on('end', () => {
      self.close();
    })
    this.connection = connection;
    this.deferred = deferred;
    return this.deferred.promise;
  }
  /**
   * add event
   * @param  {String}   event    []
   * @param  {Function} callback []
   * @return {}            []
   */
  on(event, callback){
    this.connect().then(() => {
      this.connection.on(event, callback);
    })
  }
  /**
   * wrap
   * @param  {String}    name []
   * @param  {Array} data []
   * @return {Promise}         []
   */
  async wrap(name, ...data){
    await this.connect();
    let deferred = think.defer();
    data.push((err, data) => err ? deferred.reject(err) : deferred.resolve(data));
    this.connection[name].apply(this.connection, data);
    return deferred.promise;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.wrap('get', name);
  }
  /**
   * set data
   * @param {String} name    []
   * @param {String} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.config.timeout){
    let setP = [this.wrap('set', name, value)];
    if (timeout) {
      setP.push(this.expire(name, timeout));
    }
    return Promise.all(setP);
  }
  /**
   * set data expire
   * @param  {String} name    []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  expire(name, timeout){
    return this.wrap('expire', name, timeout);
  }
  /**
   * close
   * @return {} []
   */
  close(){
    if (this.connection) {
      this.connection.end();
      this.connection = null;
    }
  }
}