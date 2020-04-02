import { i18n, I18nFormatModule } from 'i18next';
import IntlMessageFormat, { FormatXMLElementFn } from 'intl-messageformat';
import * as utils from './utils';

declare module 'i18next' {
  interface i18n { // eslint-disable-line @typescript-eslint/class-name-casing
    IntlMessageFormat: typeof IntlMessageFormat;
    ICU: ICU;
    store: ResourceStore & { on(event: string, callback: () => void): void };
  }
}

/**
 * @see https://github.com/formatjs/formatjs/tree/master/packages/intl-messageformat#user-defined-formats
 */
// prettier-ignore
export interface IcuFormats {
  number?: {
    [styleName: string]: Intl.NumberFormatOptions;
  };
  date?: {
    [styleName: string]: Intl.DateTimeFormatOptions;
  };
  time?: {
    [styleName: string]: Intl.DateTimeFormatOptions;
  };
}

export interface IcuConfig {
  memoize?: boolean;
  memoizeFallback?: boolean;
  formats?: IcuFormats;
  bindI18n?: string;
  bindI18nStore?: string;
}

export interface IcuInstance extends I18nFormatModule {
  init(i18next?: i18n | null, options?: IcuConfig): void;
  addUserDefinedFormats(formats: IcuFormats): void;
  clearCache(): void;
}

function getDefaults() {
  return {
    memoize: true,
    memoizeFallback: false,
    bindI18n: '',
    bindI18nStore: ''
  };
}

class ICU implements IcuInstance {
  static readonly type = 'i18nFormat'

  readonly type: 'i18nFormat'

  private mem: {};

  private options: IcuConfig = {}

  private formats?: IcuFormats

  constructor(config?: IcuConfig) {
    this.type = 'i18nFormat';
    this.mem = {};

    this.init(null, config);
  }

  init(i18next?: i18n | null, options?: IcuConfig) {
    const i18nextOptions = (i18next && i18next.options && i18next.options.i18nFormat) || {};
    this.options = utils.defaults(i18nextOptions, options, this.options || {}, getDefaults());
    this.formats = this.options.formats;

    if (i18next) {
      const { bindI18n, bindI18nStore, memoize } = this.options;

      i18next.IntlMessageFormat = IntlMessageFormat;
      i18next.ICU = this;

      if (memoize) {
        if (bindI18n) {
          i18next.on(bindI18n, () => this.clearCache());
        }

        if (bindI18nStore) {
          i18next.store.on(bindI18nStore, () => this.clearCache());
        }
      }
    }
  }

  addUserDefinedFormats(formats: IcuFormats) {
    this.formats = this.formats ? { ...this.formats, ...formats } : formats;
  }

  parse<T>(res: string, options: Record<string, string | number | boolean | Date | T | FormatXMLElementFn<T, string | (string | T)[]> | null | undefined> | undefined, lng: string, ns: string, key: string, info?: { resolved?: { res: boolean } }) {
    const hadSuccessfulLookup = info?.resolved?.res;
    const memKey = this.options.memoize && `${lng}.${ns}.${key.replace(/\./g, '###')}` || undefined;

    let fc: IntlMessageFormat | undefined;
    if (this.options.memoize) {
      fc = utils.getPath(this.mem, memKey!);
    }
    if (!fc) {
      fc = new IntlMessageFormat(res, lng, this.formats);
      if (this.options.memoize && (this.options.memoizeFallback || !info || hadSuccessfulLookup))
        utils.setPath(this.mem, memKey!, fc);
    }
    return fc.format(options);
  }

  clearCache() {
    this.mem = {};
  }
}

export { ICU };
