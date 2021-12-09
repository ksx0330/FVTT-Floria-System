export class FloriaRegisterHelpers {
  static init() {
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifSuccess', function(arg1, arg2, options) {
      return (arg1 <= arg2) ? options.fn(this) : options.inverse(this);
    });
  }
}
