#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_services
----------------------------------

Tests for `services` module.
"""
import unittest
from dbseeder.services import Caster, Normalizer, Normalizable


class TestCaster(unittest.TestCase):

    def test_empty_string_returns_none(self):
        actual = Caster.cast('', 'TEXT')
        self.assertIsNone(actual, msg='text')

        actual = Caster.cast('', 'LONG')
        self.assertIsNone(actual, msg='long')

        actual = Caster.cast('', 'SHORT')
        self.assertIsNone(actual, msg='short')

        actual = Caster.cast('', 'DATE')
        self.assertIsNone(actual, msg='date')

        actual = Caster.cast('', 'FLOAT')
        self.assertIsNone(actual, msg='float')

        actual = Caster.cast('', 'DOUBLE')
        self.assertIsNone(actual, msg='double')


class TestNormalizer(unittest.TestCase):
    def setUp(self):
        self.patient = Normalizer()

    def test_unit_is_unchanged_if_chemical_is_none(self):
        amount, unit, chemical = self.patient.normalize_unit(None, 'unit', 0)
        self.assertEqual(unit, 'unit')

    def test_station_id_normalization(self):
        self.patient = Normalizable(self.patient)

        self.patient.normalize_fields['stationid'] = ('UTAHDWQ_WQX-4946750', 0)

        actual = self.patient.normalize(['UTAHDWQ_WQX-4946750', 'Junk'])

        self.assertListEqual(actual, ['UTAHDWQ-4946750', 'Junk'])

    def test_sdwis_normalization(self):
        pass

    def test_table_normalization(self):
        pass
