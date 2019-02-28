# object-mapper

Makes object-to-object transformation easy.

![stars](https://img.shields.io/github/stars/digitregroup/object-mapper.svg)
![forks](https://img.shields.io/github/forks/digitregroup/object-mapper.svg)

![](https://david-dm.org/digitregroup/object-mapper/status.svg)
![](https://david-dm.org/digitregroup/object-mapper/dev-status.svg)

## Quick example

```js
const sourceObject = {
  fabfour: { user_count: 4 },
  user: [
    {
      first:       'John',
      last:        'Lennon',
      instruments: [
        { name: 'Guitar', colour: 'Red' },
        { name: 'Bass guitar', colour: 'Blue' }
      ]
    },
    {
      first:   'Paul',
      last:    'McCartney',
      picture: ['picture0.jpg', 'picture1.png', 'picture2.gif' ]
    },
    { first: 'George', last: 'Harrison' },
    { first: 'Ringo', last: 'Starr' }
  ]
};

const mapping = {
  'ringo.last_name':        'user[first=Ringo].last',
  'paul.pictures':          'user.1.picture[]',
  'john.bass.colour':       'user.0.instruments.1.colour',
  'amount_of_band_members': 'fabfour.user_count',
};

const result = ObjectMapper.mapItem(sourceObject, mapping);

//{
//  "ringo": {
//    "last_name": "Starr"
//  },
//  "paul": {
//    "pictures": [
//      "picture0.jpg",
//      "picture1.png",
//      "picture2.gif"
//    ]
//  },
//  "john": {
//    "bass": {
//      "colour": "Blue"
//    }
//  },
//  "amount_of_band_members": 4
//}
```

## Features

**Dot notation matching**

```js
ObjectMapper.mapItem (
  {parent: {child: {value: 'bar'}}},
  {result: 'parent.child.value'}
);

// {"result":"bar"}
```

**Query matching**

```js
ObjectMapper.mapItem (
  {
    children: [
      {name: 'foo', value: 'bar'},
      {name: 'baz', value: 'biz'}
    ]
  },
  {result: 'children[name=baz].value'}
);

// {"result":"biz"}
```

**Data transformation**

```js
ObjectMapper.mapItem (
  {
    user: {
      name:      'lennon',
      firstname: 'john'
    }
  },
  {
    'result': [
      'user.name',
      name => name.toUpperCase(),
      uppername => uppername.split('')
    ]
  }
);

// {"result":["L","E","N","N","O","N"]}
```

**Dot notation object conversion**

```js
ObjectMapper.mapItem (
  {foo: 'bar'},
  {'target.name.can.be.anything.0': 'foo'}
);

// {"target":{"name":{"can":{"be":{"anything":["bar"]}}}}}
```

## Install

`npm install --save @digitregroup/object-mapper`

## Dependencies

Package | Version | Dev
--- |:---:|:---:
[flat](https://www.npmjs.com/package/flat) | ^4.1.0 | ✖
[chai](https://www.npmjs.com/package/chai) | ^4.2.0 | ✔
[cross-env](https://www.npmjs.com/package/cross-env) | ^5.2.0 | ✔
[laravel-mix](https://www.npmjs.com/package/laravel-mix) | ^4.0.14 | ✔
[mocha](https://www.npmjs.com/package/mocha) | ^6.0.2 | ✔
[nyc](https://www.npmjs.com/package/nyc) | ^13.3.0 | ✔
[vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler) | ^2.6.7 | ✔


## Contributing

Contributions welcome; Please submit all pull requests against the develop branch. If your pull request contains JavaScript patches or features, you should include relevant unit tests. Thanks!

## Author

DigitRE Group

## License

 - **MIT** : http://opensource.org/licenses/MIT
