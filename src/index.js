/** @module knexpress */

const knexExtensions = require('./knex-extensions');
const modelFactory = require('./model-factory');
const DbObjectAlreadyRegisteredError =
  require('./errors/db-object-already-registered-error');

const DEFAULT_OPTIONS = {
  convertCase: true,
};

/**
 * Entry class for accessing the functionality of Knexpress.
 */
class Knexpress {
  /**
   * Creates a new Knexpress ORM instance.
   * @property {Object} knex Knex client instance to which database functions
   * shall be bound.
   * @property {Object} [options] Additional options regarding ORM.
   */
  // TODO:
  // @property {boolean} [options.convertCase=true] If set to true, then the ORM
  // will handle letter case convertion for strings automatically (between
  // camelCase and snake_case).
  constructor(knex, options) {
    // Create a shallow copy of the Knex client and extend its methods
    this.knex = Object.assign({}, knex, knexExtensions);
    this.knex.client.QueryBuilder.prototype = Object.assign(
      knex.client.QueryBuilder.prototype,
      knexExtensions
    );

    // Parse and store options
    this.options = Object.assign(DEFAULT_OPTIONS, options);

    // Initialize Model registry
    Object.defineProperty(this, '_models', {
      value: {},
    });
  }

  /**
   * Base Model class corresponding to the current ORM instance.
   * @type Model
   */
  get Model() {
    return modelFactory(this);
  }

  /**
   * Registers a static Model object to the list of database objects.
   * @property {Model} Model Model to be registered.
   * @property {string} [name] Name under which the Model shall be registered.
   */
  register(model, name) {
    // Determine the Model's name and then check if it's already registered
    const modelName = name || model.name;
    if (Object.keys(this._models).includes(modelName)) {
      throw new DbObjectAlreadyRegisteredError(modelName);
    }

    this._models[modelName] = model;
    return model;
  }
}

module.exports = Knexpress;
