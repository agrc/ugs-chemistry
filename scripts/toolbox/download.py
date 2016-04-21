import arcpy
import zipfile
import glob
import secrets

"""
input parameters:
0 - format:String (kml | shapefile | csv) the format of the data requested
1 - query:String the query to filter for the Results requested

output parameters:
2 - zipfile:File the url to the .zip file for download
"""


resultsTBName = r'{}\\UGSWaterChemistry.ugswaterchemistry.Results'.format(secrets.SDE_CONNECTION)
stationsFCName = r'{}\\UGSWaterChemistry.ugswaterchemistry.Stations'.format(secrets.SDE_CONNECTION)


def main(secure=False):
    exclude_query = 'ResultValue IS NOT NULL AND ResultValue != 0'

    if not secure:
        exclude_query += ' AND DataSource != \'SDWIS\''

    query = exclude_query + ' AND ' + arcpy.GetParameterAsText(1)
    format = arcpy.GetParameterAsText(0)

    arcpy.env.workspace = secrets.SDE_CONNECTION

    # get results as csv
    print('converting results to csv')
    resultsOutput = arcpy.TableToTable_conversion(resultsTBName,
                                                  arcpy.env.scratchFolder,
                                                  'Results.csv',
                                                  query)

    # get stations query from results station id's
    ids = []
    print('building station ids list')
    with arcpy.da.SearchCursor(resultsTBName, ['StationId'], query) as cursor:
        for row in cursor:
            ids.append(row[0])

    ids = set(ids)

    # get stations based on format
    stationsQuery = 'StationId IN (\'{}\')'.format('\',\''.join(ids))

    if format == 'kml':
        print('making layer')
        stationsLayer = arcpy.mapping.Layer(secrets.LAYER_FILE)
        stationsLayer.setSelectionSet('NEW', ids)
        stationsLayer.definitionQuery = stationsQuery

        print('exporting to kml')
        stationsOutput = arcpy.LayerToKML_conversion(stationsLayer,
                                                     arcpy.env.scratchFolder + '\\' + 'Stations.kmz')
    elif format == 'shapefile':
        print('exporting shapefile')
        stationsOutput = arcpy.FeatureClassToFeatureClass_conversion(stationsFCName,
                                                                     arcpy.env.scratchFolder,
                                                                     'Stations.shp',
                                                                     where_clause=stationsQuery)
        stationsOutput = glob.glob(arcpy.env.scratchFolder + '\\Stations.*')
    elif format == 'csv':
        print('exporting csv (stations)')
        table_view = arcpy.MakeTableView_management(stationsFCName, 'stationsTable', where_clause=stationsQuery)
        stationsOutput = arcpy.TableToTable_conversion(table_view, arcpy.env.scratchFolder, 'Stations.csv')
    else:
        raise 'Unrecognized format: {}'.format(format)

    # zip both datasets
    print('building zipfile')
    zipfile_path = arcpy.env.scratchFolder + '\\' + 'data.zip'
    with zipfile.ZipFile(zipfile_path, 'w', compression=zipfile.ZIP_DEFLATED) as file:
        results_path = str(resultsOutput)
        file.write(results_path, results_path.split('\\')[-1])
        if format == 'shapefile':
            for f in stationsOutput:
                file.write(f, f.split('\\')[-1])
        else:
            stations_path = str(stationsOutput)
            file.write(stations_path, stations_path.split('\\')[-1])

    # return path to zip file
    arcpy.SetParameter(2, zipfile_path)

if __name__ == '__main__':
    # clean up
    delete_files = [arcpy.env.scratchFolder + '\\' + df for df in ['Results.csv', 'Stations.kmz', 'data.zip']]
    for path in glob.glob(arcpy.env.scratchFolder + '\\Stations.*') + delete_files:
        if arcpy.Exists(path):
            arcpy.Delete_management(path)

    main()
