[![Build Status](https://travis-ci.org/agrc/ugs-chemistry.svg?branch=master)](https://travis-ci.org/agrc/ugs-chemistry)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-ugs-chemistry.svg)](https://saucelabs.com/u/agrc-ugs-chemistry)

ugs-chemistry
=============

Water Chemistry data viewer built for UGS

### URL's
Production: [geology.utah.gov/apps/waterchem](http://geology.utah.gov/apps/waterchem)

Test: [test.mapserv.utah.gov/ugschemistry](http://test.mapserv.utah.gov/ugschemistry)

[current mockup](http://share.flairbuilder.com/?sid=I64FYv95R7)

### Installation
All services go into a folder called `UGSChemistry`(stage & dev) or `Water`(prod).

Publish `scripts/toolbox/Toolbox.tbx/BuildChart` & `Download` to `/Toolbox`
- update secrets.py to point to the correct server
- asynchronous
- install `pymssql` by running `pip install scripts/charts/pymssql-2.1.2-cp27-cp27m-win_amd64.whl` (Got the wheels from [here](http://www.lfd.uci.edu/~gohlke/pythonlibs/#pymssql))
- Defaults values should be sufficient to successfully run the tools.
- May need to manually copy `scripts/toolbox/database_connections/` to `...\arcgisserver\directories\arcgissystem\arcgisinput\UGSChemistry(or Water)\ToolboxSecure.GPServer\extracted\v101\toolbox` & `...\arcgisserver\directories\arcgissystem\arcgisinput\UGSChemistry(or Water)\Toolbox.GPServer\extracted\v101\toolbox`

Publish `scripts/toolbox/Toolbox.tbx/BuildChartSecure` and `DownloadSecure` to `/ToolboxSecure`
- same params as above only lock down to ugs roles
- you may need to clear out your scratch folder (restart Catalog) before running `DownloadSecure`.

If you have trouble with broken data source errors when publishing try deleting the service draft and restarting Catalog.

Publish `maps/MapService.mxd` to `/MapService` and `maps/SecureMapService.mxd` to `/SecureMapService`.
- Max pooling = 5
- Max records returned = 5000
- Check "Allow per request modification of layer order and symbology" and register the SDE database as a dynamic workspace with the an ID of "UGSWaterChemistry".

#### Dependencies
- [agrc/PermissionProxy](https://github.com/agrc/ArcGisServerPermissionsProxy)
- [pymssql](http://www.pymssql.org/en/latest/)

### Contacts
**Paul Inkenbrandt**  
paulinkenbrandt@utah.gov  
**Marshall Robinson (Server Admin)**  
marshallrobinson@utah.gov  

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
