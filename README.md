[![Build Status](https://travis-ci.org/agrc/ugs-chemistry.svg?branch=master)](https://travis-ci.org/agrc/ugs-chemistry)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-ugs-chemistry.svg)](https://saucelabs.com/u/agrc-ugs-chemistry)
ugs-chemistry
=============

Water Chemistry data viewer built for UGS

### URL's
[test.mapserv.utah.gov/ugschemistry](http://test.mapserv.utah.gov/ugschemistry)
[current mockup](http://share.flairbuilder.com/?sid=I64FYv95R7)

### Installation
All services go into a folder called `UGSChemistry`.

Publish `scripts/charts/buildChart.py` to `/Toolbox`
- sync
- install `pymssql` by running `pip install scripts/charts/pymssql-2.1.2-cp27-cp27m-win_amd64.whl` (Got the wheels from [here](http://www.lfd.uci.edu/~gohlke/pythonlibs/#pymssql))
- Use `StationId IN (SELECT StationId FROM ugswaterchemistry.Stations WHERE CountyCode IN (49005)) AND Param = 'nitrate'` for `defQuery`
- You'll likely need to manually copy `scripts/charts/secrets.py` to `C:\arcgisserver\directories\arcgissystem\arcgisinput\UGSChemistry\Toolbox.GPServer\extracted\v101\charts`

Publish `scripts/charts/buildChartSecure.py` to `/ToolboxSecure`
- same params as above only lock down to ugs roles

Publish `maps/MapService.mxd` to `/MapService`

### Contacts
**Paul Inkenbrandt**
paulinkenbrandt@utah.gov

### Information from Paul
[**SOW**](https://docs.google.com/a/utah.gov/document/d/1Vc6JsHJuqKI29NZRqGk_JSLdM3AWy2lI9_D1vqEp9iE/edit)
[**Parameters Requested**](https://docs.google.com/a/utah.gov/spreadsheets/d/1EY_30rSQxvH2JrVhjVSRzOdyh9nVryA5RbofVZhp0hs/edit?usp=sharing)

EPA Mapping Services
http://www.epa.gov/waters/geoservices/docs/waters_mapping_services.html
http://www.epa.gov/storet/wqx/wqx_getdomainvalueswebservice.html
http://cdx.epa.gov/WQXWeb/Services.asmx

USGS Mapping Services
http://qwwebservices.usgs.gov/

Water Quality Portal (Combines EPA STORET and USGS NWIS)
http://www.waterqualitydata.us/webservices_documentation.jsp

Example Sites
http://maps.waterdata.usgs.gov/mapper/
http://watersgeo.epa.gov/mwm/
http://enviro.deq.utah.gov/
http://cida.usgs.gov/ngwmn/index.jsp
