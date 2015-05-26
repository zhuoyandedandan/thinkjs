'use strict';

import * as path from 'path';

/**
 * write html cache
 * @type {Class}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @param  {String} content [view content]
   * @return {}         []
   */
  run(content){
    let cache = this.config('html_cache');
    if (!cache.on || !this.http.html_filename) {
      return content;
    }
    this.recordViewFile();
    let file = `${this.cache.path}/${this.http.html_filename}`;
    think.mkdir(path.dirname(file));
    fs.writeFile(file, content);
    return content;
  }
  /**
   * record view file
   * @return {} []
   */
  recordViewFile(){
    let http = this.http;
    let tplFile = http.tpl_file;
    let key = `${http.module}/${http.controller}/${http.action}`;
    thinkCache(thinkCache.VIEW, key, tplFile);
  }
}