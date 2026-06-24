import React, { useState } from 'react';
import { MdmTable } from '../../components/ui/MdmTable';
import type { ColDef, FieldDef } from '../../components/ui/MdmTable';
import {
  fetchCompanyTypes, createCompanyType, updateCompanyType, deleteCompanyType,
  fetchCompanies, createCompany, updateCompany, deleteCompany,
  fetchMdmFleet, createMdmFleet, updateMdmFleet, deleteMdmFleet,
  fetchVesselTypes, createVesselType, updateVesselType, deleteVesselType,
  fetchFlags, createFlag, updateFlag, deleteFlag,
  fetchVesselOwners, createVesselOwner, updateVesselOwner, deleteVesselOwner,
  fetchVesselGroups, createVesselGroup, updateVesselGroup, deleteVesselGroup,
  fetchYards, createYard, updateYard, deleteYard,
  fetchCargo, createCargo, updateCargo, deleteCargo,
  fetchMdmCountries, createMdmCountry, updateMdmCountry, deleteMdmCountry,
  fetchMdmPorts, createMdmPort, updateMdmPort, deleteMdmPort,
  fetchMdmCurrencies, createMdmCurrency, updateMdmCurrency, deleteMdmCurrency,
  fetchGeneralRef, createGeneralRef, updateGeneralRef, deleteGeneralRef,
} from '../../services/mdmAdminService';

// ─── sub-nav config ────────────────────────────────────────────────────────────
type SubItem = {
  key: string;
  label: string;
};
type Group = {
  label: string;
  items: SubItem[];
};
const GROUPS: Group[] = [
  {
    label: 'Companies',
    items: [
      { key: 'company-types',          label: 'Company Types' },
      { key: 'company-type-groups',    label: 'Company Type Groups' },
      { key: 'departments',            label: 'Departments' },
      { key: 'ship-management-centre', label: 'Ship Management Centre' },
      { key: 'crew-service-center',    label: 'Crew Service Center' },
      { key: 'value-added-services',   label: 'Value Added Services' },
      { key: 'all-companies',          label: 'All Companies' },
      { key: 'external-manager',       label: 'External Manager' },
    ],
  },
  {
    label: 'Vessels',
    items: [
      { key: 'vessel-sub-types',       label: 'Sub Types' },
      { key: 'vessel-types',           label: 'Types' },
      { key: 'fleet',                  label: 'Fleet' },
      { key: 'class',                  label: 'Class' },
      { key: 'flags',                  label: 'Flags' },
      { key: 'management-types',       label: 'Management Types' },
      { key: 'special-feature',        label: 'Special Feature' },
      { key: 'vessel-departments',     label: 'Vessel Departments' },
      { key: 'registered-owners',      label: 'Registered Owners' },
      { key: 'ultimate-owners',        label: 'Ultimate Owners' },
      { key: 'beneficial-owner',       label: 'Beneficial Owner' },
      { key: 'doc',                    label: 'DOC' },
      { key: 'company-owner',          label: 'Company Owner' },
      { key: 'contracting-company',    label: 'Contracting Company' },
      { key: 'bsm-contracting',        label: 'BSM Contracting' },
      { key: 'residential-manager',    label: 'Residential Manager' },
      { key: 'yards',                  label: 'Yards' },
      { key: 'pi-club',                label: 'P&I Club' },
      { key: 'vessel-mgmt-group',      label: 'Vessel Mgmt Group' },
      { key: 'cargo-register',         label: 'Cargo Register' },
      { key: 'cargo-product',          label: 'Cargo Product' },
      { key: 'coating-system',         label: 'Coating System' },
    ],
  },
  {
    label: 'Geographical Info',
    items: [
      { key: 'countries',    label: 'Countries' },
      { key: 'regions',      label: 'Regions' },
      { key: 'citizenships', label: 'Citizenships' },
      { key: 'nationalities',label: 'Nationalities' },
      { key: 'currencies',   label: 'Currencies' },
      { key: 'airports',     label: 'Airports' },
      { key: 'ports',        label: 'Ports' },
    ],
  },
  {
    label: 'General',
    items: [
      { key: 'relations',          label: 'Relations' },
      { key: 'civil-status',       label: 'Civil Status' },
      { key: 'religions',          label: 'Religions' },
      { key: 'languages',          label: 'Languages' },
      { key: 'titles',             label: 'Titles' },
      { key: 'bank-branch',        label: 'Bank/Branch Master' },
      { key: 'common-parameters',  label: 'Common Parameters' },
      { key: 'vessel-groups',      label: 'Vessel Groups' },
    ],
  },
];

// ─── panel map ─────────────────────────────────────────────────────────────────

const STATUS_OPTS = ['Active', 'Inactive'];

// Company Types & company-type-groups share same module, filtered by Group
const companyTypeCols: ColDef[] = [
  { key: 'Code',   label: 'Code',   width: '100px' },
  { key: 'Name',   label: 'Name' },
  { key: 'Group',  label: 'Group' },
  { key: 'Status', label: 'Status', width: '110px' },
];
const companyTypeFields: FieldDef[] = [
  { key: 'Name',   label: 'Name',   required: true },
  { key: 'Code',   label: 'Code',   placeholder: 'e.g. SMC' },
  { key: 'Group',  label: 'Group',  placeholder: 'e.g. Owner-related' },
  { key: 'Status', label: 'Status', type: 'select', options: STATUS_OPTS },
];
const companyTypeDefault = { Name: '', Code: '', Group: '', Status: 'Active' };

const companyCols: ColDef[] = [
  { key: 'Code',    label: 'Code',    width: '80px' },
  { key: 'Name',    label: 'Name' },
  { key: 'Type',    label: 'Type',    width: '160px' },
  { key: 'Country', label: 'Country', width: '120px' },
  { key: 'Email',   label: 'Email',   width: '200px' },
  { key: 'Status',  label: 'Status',  width: '110px' },
];
const companyFields: FieldDef[] = [
  { key: 'Name',    label: 'Name',    required: true },
  { key: 'Code',    label: 'Code' },
  { key: 'Type',    label: 'Type',    type: 'select', options: ['Ship Management Centre', 'Owner', 'Crew Service Centre', 'Supplier', 'Charterer', 'Agent', 'Classification Society', 'P&I Club'] },
  { key: 'Country', label: 'Country' },
  { key: 'Address', label: 'Address', type: 'textarea' },
  { key: 'Email',   label: 'Email',   type: 'email' },
  { key: 'Phone',   label: 'Phone' },
  { key: 'Status',  label: 'Status',  type: 'select', options: STATUS_OPTS },
];
const companyDefault = { Name: '', Code: '', Type: 'Ship Management Centre', Country: '', Address: '', Email: '', Phone: '', Status: 'Active' };

const fleetCols: ColDef[] = [
  { key: 'Code',        label: 'Code',        width: '100px' },
  { key: 'Name',        label: 'Name' },
  { key: 'Description', label: 'Description' },
  { key: 'Status',      label: 'Status',      width: '110px' },
];
const fleetFields: FieldDef[] = [
  { key: 'Name',        label: 'Name',        required: true },
  { key: 'Code',        label: 'Code' },
  { key: 'Description', label: 'Description', type: 'textarea' },
  { key: 'Status',      label: 'Status',      type: 'select', options: STATUS_OPTS },
];
const fleetDefault = { Name: '', Code: '', Description: '', Status: 'Active' };

const vesselTypeCols: ColDef[] = [
  { key: 'Code',     label: 'Code',     width: '100px' },
  { key: 'Name',     label: 'Name' },
  { key: 'Category', label: 'Category', width: '160px' },
  { key: 'Status',   label: 'Status',   width: '110px' },
];
const vesselTypeFields: FieldDef[] = [
  { key: 'Name',     label: 'Name',     required: true },
  { key: 'Code',     label: 'Code' },
  { key: 'Category', label: 'Category', type: 'select', options: ['Vessel Type', 'Sub Type', 'Management Type', 'Special Feature'] },
  { key: 'Status',   label: 'Status',   type: 'select', options: STATUS_OPTS },
];
const vesselTypeDefault = { Name: '', Code: '', Category: 'Vessel Type', Status: 'Active' };

const flagCols: ColDef[] = [
  { key: 'Code',    label: 'Code',    width: '80px' },
  { key: 'Name',    label: 'Name' },
  { key: 'Country', label: 'Country' },
  { key: 'Status',  label: 'Status',  width: '110px' },
];
const flagFields: FieldDef[] = [
  { key: 'Name',    label: 'Name',    required: true },
  { key: 'Code',    label: 'Code' },
  { key: 'Country', label: 'Country' },
  { key: 'Status',  label: 'Status',  type: 'select', options: STATUS_OPTS },
];
const flagDefault = { Name: '', Code: '', Country: '', Status: 'Active' };

const ownerCols: ColDef[] = [
  { key: 'Name',       label: 'Name' },
  { key: 'Owner_Type', label: 'Type',    width: '160px' },
  { key: 'Country',    label: 'Country', width: '120px' },
  { key: 'IMO_Number', label: 'IMO No.', width: '120px' },
  { key: 'Status',     label: 'Status',  width: '110px' },
];
const ownerFields: FieldDef[] = [
  { key: 'Name',       label: 'Name',       required: true },
  { key: 'Owner_Type', label: 'Owner Type', type: 'select', options: ['Registered Owner', 'Beneficial Owner', 'Ultimate Owner', 'Company Owner', 'Residential Manager', 'DOC Holder', 'PI Club'] },
  { key: 'Country',    label: 'Country' },
  { key: 'IMO_Number', label: 'IMO Number' },
  { key: 'Address',    label: 'Address',    type: 'textarea' },
  { key: 'Email',      label: 'Email',      type: 'email' },
  { key: 'Status',     label: 'Status',     type: 'select', options: STATUS_OPTS },
];
const ownerDefault = { Name: '', Owner_Type: 'Registered Owner', Country: '', IMO_Number: '', Address: '', Email: '', Status: 'Active' };

const vesselGroupCols: ColDef[] = [
  { key: 'Code',       label: 'Code',       width: '100px' },
  { key: 'Name',       label: 'Name' },
  { key: 'Group_Type', label: 'Group Type', width: '180px' },
  { key: 'Status',     label: 'Status',     width: '110px' },
];
const vesselGroupFields: FieldDef[] = [
  { key: 'Name',       label: 'Name',       required: true },
  { key: 'Code',       label: 'Code' },
  { key: 'Group_Type', label: 'Group Type', type: 'select', options: ['Fleet Group', 'Management Group', 'Vessel Department', 'Vessel User Setting'] },
  { key: 'Status',     label: 'Status',     type: 'select', options: STATUS_OPTS },
];
const vesselGroupDefault = { Name: '', Code: '', Group_Type: 'Fleet Group', Status: 'Active' };

const yardCols: ColDef[] = [
  { key: 'Code',    label: 'Code',    width: '100px' },
  { key: 'Name',    label: 'Name' },
  { key: 'Country', label: 'Country', width: '140px' },
  { key: 'City',    label: 'City',    width: '120px' },
  { key: 'Status',  label: 'Status',  width: '110px' },
];
const yardFields: FieldDef[] = [
  { key: 'Name',    label: 'Name',    required: true },
  { key: 'Code',    label: 'Code' },
  { key: 'Country', label: 'Country' },
  { key: 'City',    label: 'City' },
  { key: 'Status',  label: 'Status',  type: 'select', options: STATUS_OPTS },
];
const yardDefault = { Name: '', Code: '', Country: '', City: '', Status: 'Active' };

const cargoCols: ColDef[] = [
  { key: 'Code',        label: 'Code',        width: '100px' },
  { key: 'Name',        label: 'Name' },
  { key: 'Cargo_Type',  label: 'Cargo Type',  width: '150px' },
  { key: 'Description', label: 'Description' },
  { key: 'Status',      label: 'Status',      width: '110px' },
];
const cargoFields: FieldDef[] = [
  { key: 'Name',        label: 'Name',        required: true },
  { key: 'Code',        label: 'Code' },
  { key: 'Cargo_Type',  label: 'Cargo Type',  type: 'select', options: ['Cargo Product', 'Cargo Register', 'Coating System'] },
  { key: 'Description', label: 'Description', type: 'textarea' },
  { key: 'Status',      label: 'Status',      type: 'select', options: STATUS_OPTS },
];
const cargoDefault = { Name: '', Code: '', Cargo_Type: 'Cargo Product', Description: '', Status: 'Active' };

const countryCols: ColDef[] = [
  { key: 'Code',        label: 'Code',        width: '80px' },
  { key: 'Name',        label: 'Name' },
  { key: 'Region',      label: 'Region',      width: '120px' },
  { key: 'Nationality', label: 'Nationality', width: '120px' },
  { key: 'Currency',    label: 'Currency',    width: '100px' },
  { key: 'Status',      label: 'Status',      width: '110px' },
];
const countryFields: FieldDef[] = [
  { key: 'Name',        label: 'Name',        required: true },
  { key: 'Code',        label: 'ISO Code',    placeholder: 'e.g. SG' },
  { key: 'Region',      label: 'Region' },
  { key: 'Nationality', label: 'Nationality' },
  { key: 'Currency',    label: 'Currency Code' },
  { key: 'Status',      label: 'Status',      type: 'select', options: STATUS_OPTS },
];
const countryDefault = { Name: '', Code: '', Region: '', Nationality: '', Currency: '', Status: 'Active' };

const portCols: ColDef[] = [
  { key: 'Code',      label: 'Code',      width: '80px' },
  { key: 'Name',      label: 'Name' },
  { key: 'Country',   label: 'Country',   width: '120px' },
  { key: 'UN_LOCODE', label: 'UN LOCODE', width: '110px' },
  { key: 'Port_Type', label: 'Type',      width: '110px' },
  { key: 'Status',    label: 'Status',    width: '110px' },
];
const portFields: FieldDef[] = [
  { key: 'Name',      label: 'Name',      required: true },
  { key: 'Code',      label: 'Code' },
  { key: 'Country',   label: 'Country' },
  { key: 'UN_LOCODE', label: 'UN LOCODE' },
  { key: 'Port_Type', label: 'Port Type', type: 'select', options: ['Sea Port', 'Airport', 'Dry Port'] },
  { key: 'Latitude',  label: 'Latitude',  type: 'number' },
  { key: 'Longitude', label: 'Longitude', type: 'number' },
  { key: 'Status',    label: 'Status',    type: 'select', options: STATUS_OPTS },
];
const portDefault = { Name: '', Code: '', Country: '', UN_LOCODE: '', Port_Type: 'Sea Port', Latitude: 0, Longitude: 0, Status: 'Active' };

const currencyCols: ColDef[] = [
  { key: 'Code',          label: 'Code',   width: '80px' },
  { key: 'Symbol',        label: 'Symbol', width: '80px' },
  { key: 'Name',          label: 'Name' },
  { key: 'Exchange_Rate', label: 'vs USD', width: '100px' },
  { key: 'Status',        label: 'Status', width: '110px' },
];
const currencyFields: FieldDef[] = [
  { key: 'Name',          label: 'Name',          required: true },
  { key: 'Code',          label: 'ISO Code',       placeholder: 'e.g. USD' },
  { key: 'Symbol',        label: 'Symbol',         placeholder: 'e.g. $' },
  { key: 'Exchange_Rate', label: 'Exchange Rate',  type: 'number' },
  { key: 'Status',        label: 'Status',         type: 'select', options: STATUS_OPTS },
];
const currencyDefault = { Name: '', Code: '', Symbol: '', Exchange_Rate: 1, Status: 'Active' };

const genRefCols: ColDef[] = [
  { key: 'Code',        label: 'Code',        width: '100px' },
  { key: 'Name',        label: 'Name' },
  { key: 'Category',    label: 'Category',    width: '160px' },
  { key: 'Description', label: 'Description' },
  { key: 'Status',      label: 'Status',      width: '110px' },
];
const genRefFields: FieldDef[] = [
  { key: 'Name',        label: 'Name',        required: true },
  { key: 'Code',        label: 'Code' },
  { key: 'Category',    label: 'Category',    type: 'select', options: ['Language', 'Title', 'Relation', 'Civil Status', 'Religion', 'Bank Branch', 'Common Parameter', 'Vessel Group'] },
  { key: 'Description', label: 'Description', type: 'textarea' },
  { key: 'Status',      label: 'Status',      type: 'select', options: STATUS_OPTS },
];
const genRefDefault = { Name: '', Code: '', Category: 'Language', Description: '', Status: 'Active' };

// Map sub-item key → panel config
type PanelCfg = {
  title: string;
  subtitle?: string;
  cols: ColDef[];
  fields: FieldDef[];
  def: Record<string, unknown>;
  fetch: () => Promise<Record<string, unknown>[]>;
  create: (p: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, p: Record<string, unknown>) => Promise<unknown>;
  del: (id: string) => Promise<unknown>;
  search?: string[];
};

const PANELS: Record<string, PanelCfg> = {
  'company-types':          { title: 'Company Types',          cols: companyTypeCols, fields: companyTypeFields, def: companyTypeDefault,   fetch: fetchCompanyTypes,  create: createCompanyType,  update: updateCompanyType,  del: deleteCompanyType },
  'company-type-groups':    { title: 'Company Type Groups',    cols: companyTypeCols, fields: companyTypeFields, def: companyTypeDefault,   fetch: fetchCompanyTypes,  create: createCompanyType,  update: updateCompanyType,  del: deleteCompanyType },
  'departments':            { title: 'Departments',            cols: companyTypeCols, fields: companyTypeFields, def: { ...companyTypeDefault, Group: 'Department' }, fetch: fetchCompanyTypes,  create: createCompanyType,  update: updateCompanyType,  del: deleteCompanyType },
  'ship-management-centre': { title: 'Ship Management Centre', cols: companyCols,     fields: companyFields,     def: { ...companyDefault, Type: 'Ship Management Centre' }, fetch: fetchCompanies, create: createCompany, update: updateCompany, del: deleteCompany },
  'crew-service-center':    { title: 'Crew Service Center',    cols: companyCols,     fields: companyFields,     def: { ...companyDefault, Type: 'Crew Service Centre' },    fetch: fetchCompanies, create: createCompany, update: updateCompany, del: deleteCompany },
  'value-added-services':   { title: 'Value Added Services',   cols: companyCols,     fields: companyFields,     def: companyDefault,       fetch: fetchCompanies,     create: createCompany,     update: updateCompany,     del: deleteCompany },
  'all-companies':          { title: 'All Companies',          cols: companyCols,     fields: companyFields,     def: companyDefault,       fetch: fetchCompanies,     create: createCompany,     update: updateCompany,     del: deleteCompany },
  'external-manager':       { title: 'External Manager',       cols: companyCols,     fields: companyFields,     def: { ...companyDefault, Type: 'Agent' }, fetch: fetchCompanies, create: createCompany, update: updateCompany, del: deleteCompany },
  'vessel-sub-types':       { title: 'Vessel Sub Types',       cols: vesselTypeCols,  fields: vesselTypeFields,  def: { ...vesselTypeDefault, Category: 'Sub Type' },  fetch: fetchVesselTypes, create: createVesselType, update: updateVesselType, del: deleteVesselType },
  'vessel-types':           { title: 'Vessel Types',           cols: vesselTypeCols,  fields: vesselTypeFields,  def: { ...vesselTypeDefault, Category: 'Vessel Type' }, fetch: fetchVesselTypes, create: createVesselType, update: updateVesselType, del: deleteVesselType },
  'fleet':                  { title: 'Fleet',                  cols: fleetCols,       fields: fleetFields,       def: fleetDefault,         fetch: fetchMdmFleet,      create: createMdmFleet,    update: updateMdmFleet,    del: deleteMdmFleet },
  'class':                  { title: 'Class',                  cols: vesselGroupCols, fields: vesselGroupFields, def: { ...vesselGroupDefault, Group_Type: 'Fleet Group' }, fetch: fetchVesselGroups, create: createVesselGroup, update: updateVesselGroup, del: deleteVesselGroup },
  'flags':                  { title: 'Flags',                  cols: flagCols,        fields: flagFields,        def: flagDefault,          fetch: fetchFlags,         create: createFlag,        update: updateFlag,        del: deleteFlag },
  'management-types':       { title: 'Management Types',       cols: vesselTypeCols,  fields: vesselTypeFields,  def: { ...vesselTypeDefault, Category: 'Management Type' }, fetch: fetchVesselTypes, create: createVesselType, update: updateVesselType, del: deleteVesselType },
  'special-feature':        { title: 'Special Features',       cols: vesselTypeCols,  fields: vesselTypeFields,  def: { ...vesselTypeDefault, Category: 'Special Feature' }, fetch: fetchVesselTypes, create: createVesselType, update: updateVesselType, del: deleteVesselType },
  'vessel-departments':     { title: 'Vessel Departments',     cols: vesselGroupCols, fields: vesselGroupFields, def: { ...vesselGroupDefault, Group_Type: 'Vessel Department' }, fetch: fetchVesselGroups, create: createVesselGroup, update: updateVesselGroup, del: deleteVesselGroup },
  'registered-owners':      { title: 'Registered Owners',      cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'Registered Owner' },  fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'ultimate-owners':        { title: 'Ultimate Owners',        cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'Ultimate Owner' },     fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'beneficial-owner':       { title: 'Beneficial Owner',       cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'Beneficial Owner' },   fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'doc':                    { title: 'DOC',                    cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'DOC Holder' },         fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'company-owner':          { title: 'Company Owner',          cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'Company Owner' },      fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'contracting-company':    { title: 'Contracting Company',    cols: companyCols,     fields: companyFields,     def: companyDefault,       fetch: fetchCompanies,     create: createCompany,     update: updateCompany,     del: deleteCompany },
  'bsm-contracting':        { title: 'BSM Contracting',        cols: companyCols,     fields: companyFields,     def: companyDefault,       fetch: fetchCompanies,     create: createCompany,     update: updateCompany,     del: deleteCompany },
  'residential-manager':    { title: 'Residential Manager',    cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'Residential Manager' }, fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'yards':                  { title: 'Yards',                  cols: yardCols,        fields: yardFields,        def: yardDefault,          fetch: fetchYards,         create: createYard,        update: updateYard,        del: deleteYard },
  'pi-club':                { title: 'P&I Club',               cols: ownerCols,       fields: ownerFields,       def: { ...ownerDefault, Owner_Type: 'PI Club' },            fetch: fetchVesselOwners, create: createVesselOwner, update: updateVesselOwner, del: deleteVesselOwner },
  'vessel-mgmt-group':      { title: 'Vessel Mgmt Group',      cols: vesselGroupCols, fields: vesselGroupFields, def: { ...vesselGroupDefault, Group_Type: 'Management Group' }, fetch: fetchVesselGroups, create: createVesselGroup, update: updateVesselGroup, del: deleteVesselGroup },
  'cargo-register':         { title: 'Cargo Register',         cols: cargoCols,       fields: cargoFields,       def: { ...cargoDefault, Cargo_Type: 'Cargo Register' },   fetch: fetchCargo, create: createCargo, update: updateCargo, del: deleteCargo },
  'cargo-product':          { title: 'Cargo Product',          cols: cargoCols,       fields: cargoFields,       def: { ...cargoDefault, Cargo_Type: 'Cargo Product' },    fetch: fetchCargo, create: createCargo, update: updateCargo, del: deleteCargo },
  'coating-system':         { title: 'Coating System',         cols: cargoCols,       fields: cargoFields,       def: { ...cargoDefault, Cargo_Type: 'Coating System' },   fetch: fetchCargo, create: createCargo, update: updateCargo, del: deleteCargo },
  'countries':              { title: 'Countries',              cols: countryCols,     fields: countryFields,     def: countryDefault,       fetch: fetchMdmCountries,  create: createMdmCountry,  update: updateMdmCountry,  del: deleteMdmCountry },
  'regions':                { title: 'Regions',                cols: countryCols,     fields: countryFields,     def: countryDefault,       fetch: fetchMdmCountries,  create: createMdmCountry,  update: updateMdmCountry,  del: deleteMdmCountry },
  'citizenships':           { title: 'Citizenships',           cols: countryCols,     fields: countryFields,     def: countryDefault,       fetch: fetchMdmCountries,  create: createMdmCountry,  update: updateMdmCountry,  del: deleteMdmCountry },
  'nationalities':          { title: 'Nationalities',          cols: countryCols,     fields: countryFields,     def: countryDefault,       fetch: fetchMdmCountries,  create: createMdmCountry,  update: updateMdmCountry,  del: deleteMdmCountry },
  'currencies':             { title: 'Currencies',             cols: currencyCols,    fields: currencyFields,    def: currencyDefault,      fetch: fetchMdmCurrencies, create: createMdmCurrency, update: updateMdmCurrency, del: deleteMdmCurrency },
  'airports':               { title: 'Airports',               cols: portCols,        fields: portFields,        def: { ...portDefault, Port_Type: 'Airport' }, fetch: fetchMdmPorts, create: createMdmPort, update: updateMdmPort, del: deleteMdmPort },
  'ports':                  { title: 'Ports',                  cols: portCols,        fields: portFields,        def: portDefault,          fetch: fetchMdmPorts,      create: createMdmPort,     update: updateMdmPort,     del: deleteMdmPort },
  'relations':              { title: 'Relations',              cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Relation' },         fetch: () => fetchGeneralRef('Relation'),         create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'civil-status':           { title: 'Civil Status',           cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Civil Status' },      fetch: () => fetchGeneralRef('Civil Status'),      create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'religions':              { title: 'Religions',              cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Religion' },          fetch: () => fetchGeneralRef('Religion'),          create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'languages':              { title: 'Languages',              cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Language' },          fetch: () => fetchGeneralRef('Language'),          create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'titles':                 { title: 'Titles',                 cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Title' },             fetch: () => fetchGeneralRef('Title'),             create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'bank-branch':            { title: 'Bank/Branch Master',     cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Bank Branch' },       fetch: () => fetchGeneralRef('Bank Branch'),       create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'common-parameters':      { title: 'Common Parameters',      cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Common Parameter' },  fetch: () => fetchGeneralRef('Common Parameter'),  create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
  'vessel-groups':          { title: 'Vessel Groups',          cols: genRefCols,      fields: genRefFields,      def: { ...genRefDefault, Category: 'Vessel Group' },      fetch: () => fetchGeneralRef('Vessel Group'),      create: createGeneralRef, update: updateGeneralRef, del: deleteGeneralRef },
};

export function MdmCommonPage() {
  const [activeKey, setActiveKey] = useState('company-types');
  const panel = PANELS[activeKey];

  return (
    <div className="flex h-full" style={{ background: '#f8fafc' }}>
      {/* Left sub-nav */}
      <aside
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0' }}
      >
        {GROUPS.map(group => (
          <div key={group.label}>
            <div style={{ padding: '12px 16px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#94a3b8', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
              {group.label}
            </div>
            {group.items.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 16px',
                  fontSize: 12.5,
                  fontWeight: activeKey === item.key ? 600 : 400,
                  color: activeKey === item.key ? '#0ea5e9' : '#475569',
                  background: activeKey === item.key ? '#f0f9ff' : 'transparent',
                  borderLeft: activeKey === item.key ? '3px solid #0ea5e9' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  border: 'none',
                  borderLeftWidth: 3,
                  borderLeftStyle: 'solid',
                  borderLeftColor: activeKey === item.key ? '#0ea5e9' : 'transparent',
                }}
                onMouseEnter={e => { if (activeKey !== item.key) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (activeKey !== item.key) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {panel ? (
          <MdmTable
            key={activeKey}
            title={panel.title}
            subtitle={`Master data — ${panel.title}`}
            columns={panel.cols}
            fields={panel.fields}
            emptyDefault={panel.def}
            fetchFn={panel.fetch}
            createFn={panel.create}
            updateFn={panel.update}
            deleteFn={panel.del}
            searchKeys={panel.search ?? ['Name', 'Code']}
          />
        ) : (
          <div className="text-slate-400 text-sm">Select an item from the left.</div>
        )}
      </div>
    </div>
  );
}
