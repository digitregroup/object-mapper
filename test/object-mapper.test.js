require('chai').should();

const flatten = require('flat');

const ObjectMapper = require('../src/object-mapper');

const sourceObject = {
  fabfour: {
    user_count: 4
  },
  user:    [
    {
      first:       'John',
      last:        'Lennon',
      height:      180,
      instruments: [
        {name: 'Guitar', colour: 'Red',},
        {name: 'Bass guitar', colour: 'Blue',}
      ]
    },
    {
      first:   'Paul',
      last:    'McCartney',
      height:  179,
      picture: [
        'picture0.jpg',
        'picture1.png',
        'picture2.gif',
      ]
    },
    {
      first:  'George',
      last:   'Harrison',
      height: 179,
    },
    {
      first:  'Ringo',
      last:   'Starr',
      height: 172,
    }
  ]
};

describe('ObjectMapper.findValue', function () {

  const sourceData = flatten(sourceObject);

  it('Exact match', function () {

    const sourceKey = 'fabfour.user_count';
    const targetKey = 'user_count';

    const expected = {'user_count': 4};

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Query with one result', function () {

    const sourceKey = 'user.0.instruments[name=Guitar].colour';
    const targetKey = 'instrument_colour';

    const expected = {'instrument_colour': 'Red'};

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Query with zero result', function () {

    const sourceKey = 'user.0.instruments[name=Piano].colour';
    const targetKey = 'instrument_colour';

    const expected = {'instrument_colour': null};

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Query with multiple results', function () {

    const sourceKey = 'user[height=179].last';
    const targetKey = 'fabfour.whois179cmtall';

    const expected = {
      "fabfour.whois179cmtall": [
        "McCartney",
        "Harrison"
      ]
    };

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Object', function () {

    const sourceKey = 'user.0.instruments.0{}';
    const targetKey = 'user_instruments';

    const expected = {
      "user": [
        {
          "instruments": [
            {
              "name":   "Guitar",
              "colour": "Red"
            }
          ]
        }
      ]
    };

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Array', function () {

    const sourceKey = 'user.1.picture[]';
    const targetKey = 'user_pictures';

    const expected = {
      "user_pictures": ['picture0.jpg', 'picture1.png', 'picture2.gif'],
    };

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Undefined', function () {

    const sourceKey = 'user.4';
    const targetKey = 'undefined_user';

    const expected = {
      "undefined_user": null
    };

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });
  it('Range array', function () {

    const sourceKey = 'user.3.first';
    const targetKey = 'user_in_array_first_name';

    const expected = {
      "user_in_array_first_name": 'Ringo'
    };

    const data = ObjectMapper.findValue(sourceData, sourceKey, targetKey);

    return data.should.eql(expected);

  });

});

describe('ObjectMapper.arrayValue', function () {

  it('Should work correctly with arrays of 9+', function () {

    const sourceArray = flatten({entries: new Array(100).fill('test')});

    const sourceKey = 'entries[]';
    const targetKey = 'result[]';

    const data = flatten.unflatten(ObjectMapper.arrayValue(sourceArray, sourceKey, targetKey));

    return data.result.forEach(item => item.should.be.a('string'));

  });

  it('Should work correctly when array in source but not in result', function () {

    const sourceObject = {'names': [{'FirstName': 'Jacques'}]};

    const sourceKey = 'names[].FirstName';
    const targetKey = 'result.names[].name';

    const data = ObjectMapper.arrayValue(flatten(sourceObject), sourceKey, targetKey);

    return flatten.unflatten(data).result.names[0].name.should.be.a('string');

  });

});

describe('ObjectMapper.mapItem', function () {

  it('Mapping without data transformation', function () {

    const mapping = {
      'amount_of_band_members': 'fabfour.user_count',
      'ringo.last_name':        'user[first=Ringo].last',
      'john.bass.colour':       'user.0.instruments.1.colour',
      'paul.pictures':          'user.1.picture[]',
    };

    const expected = {
      "ringo":                  {
        "last_name": "Starr"
      },
      "paul":                   {
        "pictures": [
          "picture0.jpg",
          "picture1.png",
          "picture2.gif"
        ]
      },
      "john":                   {
        "bass": {
          "colour": "Blue"
        }
      },
      "amount_of_band_members": 4
    };

    const data = ObjectMapper.mapItem(sourceObject, mapping);

    return data.should.eql(expected);

  });
  it('Array = apply transformation(s) to source data', function () {

    const mapping = {
      'double_amount_of_band_members': ['fabfour.user_count', val => val * 2],
      'ringo.last_name.all_caps':      ['user[first=Ringo].last', val => val.toUpperCase()],
      'john.bass.colour.hex':          [
        'user.0.instruments.1.colour',
        val => val.toLowerCase(),
        val => ({blue: '#0000FF'})[val]
      ],
      'paul.pictures.sort_desc':       ['user.1.picture[]', val => val.sort(() => 1)],
    };

    const expected = {
      "john":                          {
        "bass": {
          "colour": {
            "hex": "#0000FF"
          }
        }
      },
      "paul":                          {
        "pictures": {
          "sort_desc": [
            "picture2.gif",
            "picture1.png",
            "picture0.jpg"
          ]
        }
      },
      "ringo":                         {
        "last_name": {
          "all_caps": "STARR"
        }
      },
      "double_amount_of_band_members": 8
    };

    const data = ObjectMapper.mapItem(sourceObject, mapping);

    return data.should.eql(expected);

  });
  it('Array of array', function () {

    const mapping = {
      'result[]': ['user.1.picture[]']
    };

    const data     = ObjectMapper.mapItem(sourceObject, mapping);
    const expected = {
      "result": [
        "picture0.jpg",
        "picture1.png",
        "picture2.gif"
      ]
    };

    return data.should.eql(expected);

  });

});
