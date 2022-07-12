import {apiGoogleElevationGet} from "./apiGoogleElevationGet";

describe('apiGoogleElevationGet', ()=>{
  test('Get elevation for two points', async ()=> {
    const elevations = await apiGoogleElevationGet([
      {
        lng: 48.17835117870872,
        lat: 16.309423872994653,
      },
      {
        lng: 48.19842905647751,
        lat: 16.31575585914963,
      },
    ]);
    expect(elevations).toMatchSnapshot();
  });
});
