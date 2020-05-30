import { AxiosInstance, AxiosResponse, AxiosError } from "axios";

export interface IRequestConfig {
  onFail?: (error: any) => void;
  finally?: () => void;
}

export interface IModelConfig extends IRequestConfig {
  cbWithModel?: boolean;
}

export interface IAxiCrudConfig {
  onFail: (error: AxiosError) => void;
  finally: () => void;
}

export default class AxiCrud<T> {
  private axI: AxiosInstance;
  private url: string;
  config: IAxiCrudConfig;
  constructor(axios: AxiosInstance, url: string, config?: IAxiCrudConfig) {
    this.axI = axios;
    this.url = url;
    this.config = config || AxiCrud.defaultConfig();
  }

  private static defaultConfig(): IAxiCrudConfig {
    return {} as IAxiCrudConfig;
  }

  private errorHandle(error: any, config?: IRequestConfig) {
    if (config && config.onFail) {
      config.onFail(error);
    } else {
      if (this.config && this.config.onFail) {
        this.config.onFail(error);
      }
    }
  }

  private finally(config?: IRequestConfig) {
    if (config && config.finally) {
      config.finally();
    } else {
      if (this.config && this.config.finally) {
        this.config.finally();
      }
    }
  }

  /**
   * Get path to a Detail View by combining url and ID
   */
  itemPath = (id: number | string): string => {
    id = id.toString();
    if (!this.url.endsWith("/") && !id.startsWith("/")) {
      id = "/" + id;
    }
    return this.url + id;
  };

  /**
   * Request the AxiCrud's url and invoke a call back with the returend list of items
   * HTTP Verb: "GET"
   * @param cb Callback to Invoke with the returned list of items
   * @param config Optional request specific configuration
   */
  withList(
    cb: (response: AxiosResponse<[T]>) => void,
    config?: IRequestConfig
  ) {
    this.axI
      .get(this.url)
      .then((res) => cb(res))
      .catch((error) => {
        this.errorHandle(error, config);
      })
      .then(() => {
        this.finally(config);
      });
  }

  /**
   * Request the item at the provided ID and invoke a callback with response data as the parameter
   * HTTP Verb: "GET"
   * @param id ID of the Item to get detail view of
   * @param cb Callback to invoke with the returend item
   * @param config Optional Request Specifc configuration
   */
  withItem(
    id: number | string,
    cb: (response: AxiosResponse<T>) => void,
    config?: IRequestConfig
  ) {
    this.axI
      .get(this.itemPath(id))
      .then((res) => cb(res))
      .catch((error) => {
        this.errorHandle(error, config);
      })
      .then(() => {
        this.finally(config);
      });
  }

  /**
   * Create the model in the API
   * HTTP Verb: "POST"
   * @param model: Model to create via the API
   * @param cb: Callback to ivoke with the response data
   * @param config: Optional request specific config
   */
  create(
    model: T,
    cb?: (data: AxiosResponse<T> | T) => void,
    config?: IModelConfig
  ) {
    this.axI
      .post(this.url, model)
      .then((res) => {
        if (cb) {
          if (config.cbWithModel) {
            cb(model);
          } else {
            cb(res);
          }
        }
      })
      .catch((error) => {
        this.errorHandle(error, config);
      })
      .then(() => {
        this.finally(config);
      });
  }

  /**
   * Update with the provided model and the provided id
   * HTTP Verb: "PUT"
   * @param model Model to post as data for the update
   * @param id ID of the element to update
   * @param cb Callback to invoke, taking model as param (TODO: Make this configurable)
   * @param config Optional Request Specific configuration
   */
  update(
    model: T,
    id: number | string,
    cb: (item: AxiosResponse<T> | T) => void,
    config?: IModelConfig
  ) {
    this.axI
      .put(this.itemPath(id) + "/", model)
      .then((res) => {
        if (config.cbWithModel) {
          cb(model);
        } else {
          cb(res);
        }
      })
      .catch((error) => {
        this.errorHandle(error, config);
      })
      .then(() => {
        this.finally(config);
      });
  }

  /**
   * Delete item with the provided ID
   * HTTP Verb: "DELETE"
   * @param id ID of the entity to delete
   * @param cb Callback to invoke after sucsefull deletion
   * @param config Optional request specific configuration
   */
  delete(
    id: number | string,
    cb: (res: AxiosResponse<T>) => void,
    config?: IRequestConfig
  ) {
    this.axI
      .delete(this.itemPath(id))
      .then((res) => cb(res))
      .catch((error) => {
        this.errorHandle(error, config);
      })
      .then(() => {
        this.finally(config);
      });
  }
}
