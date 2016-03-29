import pymssql
from numpy import histogram, sqrt, log
from json import dumps
from arcpy import GetParameterAsText, SetParameterAsText, GetParameter
from secrets import *

db_connection = pymssql.connect(**CONNECTION)
cursor = db_connection.cursor()

"""
input parameters:
0 - defQuery:String selecting the results to be included
1 - chartType:String (histogram or scatter)
2 - logTransform:Boolean (default to True)

output parameters:
3 - data:String
4 - numResults:Long number of result rows represented in the chart
5 - numStations:Long number of stations represented by the rows
"""
exclude_query = 'ResultValue IS NOT NULL AND ResultValue != 0'


def get_histogram(def_query, logTransform):
    cursor.execute('SELECT ResultValue FROM Results WHERE '
                   '{} AND {}'.format(def_query, exclude_query))
    if logTransform:
        rows = [log(r[0]) for r in cursor.fetchall()]
    else:
        rows = [r[0] for r in cursor.fetchall()]

    return dumps([a.tolist() for a in histogram(rows, bins=sqrt(len(rows)))])


def get_scatter(def_query):
    cursor.execute('SELECT CAST(Datediff(s, \'1970-01-01\', SampleDate) as BIGINT)*1000, ResultValue FROM Results'
                   ' WHERE {} AND {}'.format(def_query, exclude_query))
    return dumps([list(r) for r in cursor.fetchall()])


def get_num_results(def_query):
    cursor.execute('SELECT COUNT(*) FROM Results WHERE '
                   '{} AND {}'.format(def_query, exclude_query))
    return cursor.fetchone()[0]


def get_num_stations(def_query):
    cursor.execute('SELECT COUNT(*) FROM Stations WHERE StationId IN '
                   '(SELECT StationId FROM Results WHERE {} AND '
                   '{})'.format(def_query, exclude_query))
    return cursor.fetchone()[0]


# For testing
# def SetParameterAsText(n, data):
#     print('parameter: {}'.format(n))
#     print(data)


if __name__ == '__main__':
    def_query = GetParameterAsText(0)
    if GetParameterAsText(1) == 'histogram':
        SetParameterAsText(3, get_histogram(def_query, GetParameter(2)))
    else:
        SetParameterAsText(3, get_scatter(def_query))
    SetParameterAsText(4, get_num_results(def_query))
    SetParameterAsText(5, get_num_stations(def_query))
