export const addTableRecords = (
	ds_uid: string | number,
	tableId: any,
	tableRecords: any,
	columnType: any
) => {
	return { type: "ADD_TABLE_RECORDS", payload: { ds_uid, tableId, tableRecords, columnType } };
};

// ==============================
// Reset state

export const resetSampleRecords = () => {
	return { type: "RESET_SAMPLE_RECORDS" };
};

export const loadSampleRecords = (sampleRecords: any) => {
	return { type: "LOAD_SAMPLE_RECORDS_FROM_PLAYBOOK", payload: sampleRecords };
};
