import React, { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useDrop } from "react-dnd";
import ChartFilterGroupCard from "./ChartFilterGroupCard";
import {
	updateChartFilterGroupsFilters,
	updateChartFilterGroupsCollapsed, updateChartFilterGroupsName
} from "../../redux/ChartFilterGroup/ChartFilterGroupStateActions";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { NotificationDialog } from "../CommonFunctions/DialogComponents";
import { AlertColor } from "@mui/material/Alert";
import { ChartFilterGroupsProps } from '../../redux/ChartFilterGroup/ChartFilterGroupInterface';
import { ChartPropertiesStateProps } from '../../redux/ChartPoperties/ChartPropertiesInterfaces';
import { ChartFilterGroupStateProps, fieldProps } from '../../redux/ChartFilterGroup/ChartFilterGroupInterface';
import { Popover } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Checkbox } from "@mui/material";
import { deleteDashBoardSelectedTabTiles, updateDashBoardSelectedTabTiles } from '../../redux/DashBoardFilterGroup/DashBoardFilterGroupAction';
import { TileRibbonStateProps } from "../../Components/TabsAndTiles/TileRibbonInterfaces";

const ChartFilterGroups = ({
	// props
	propKey,
	group,
	fromDashboard,

	// state
	chartProp,
	chartGroup,
	tileState,
	tabTileProps,
	dashBoardGroup,

	// dispatch
	updateChartFilterGroupsFilters,
	updateChartFilterGroupsCollapsed,
	updateChartFilterGroupsName,
	deleteDashBoardSelectedTabTiles,
	updateDashBoardSelectedTabTiles

}: ChartFilterGroupsProps) => {
	const [editGroupName, setEditGroupName] = useState<boolean>(false);
	let selectedDatasetID = "";
	let selectedGroupTabTilesList: any = [];
	let dashboardTabTileList: any = []
	let tilesForSelectedTab = tileState.tileList[tabTileProps.selectedTabId];

	if (!fromDashboard) {
		selectedDatasetID = chartProp.properties[propKey].selectedDs.id;
	}
	else {
		selectedGroupTabTilesList = dashBoardGroup.filterGroupTabTiles[group.id];

		[...tilesForSelectedTab].forEach((tile: any) => {
			dashboardTabTileList.push({ name: tileState.tiles[tile].tileName, id: tile })
		});
	}




	const [severity, setSeverity] = useState<AlertColor>("success");
	const [openAlert, setOpenAlert] = useState<boolean>(false);
	const [testMessage, setTestMessage] = useState<string>("");
	const [showPopover, setShowPopover] = useState<boolean>(false);

	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;


	// let tileList = tilesForSelectedTab.map((tile: any, index: number) => {
	// 	let currentObj = tileState.tiles[tile];
	// }

	const [, drop] = useDrop({
		accept: "card",
		drop: item => handleDrop(item, group),
		collect: monitor => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	});

	const uIdGenerator = () => {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};


	///Expand Collapse Icon switch
	const ExpandCollaseIconSwitch = () => {
		return group.isCollapsed ? (
			<ChevronRightIcon
				style={{ height: "18px", width: "18px", color: "#999999" }}
				onClick={e => {
					updateChartFilterGroupsCollapsed(group.id, !group.isCollapsed);
				}}
			/>
		) : (
			<KeyboardArrowDownIcon
				style={{ height: "18px", width: "18px", color: "#999999" }}
				onClick={e => {
					updateChartFilterGroupsCollapsed(group.id, !group.isCollapsed);
				}}
			/>
		);
	};

	const handleGroupNameValue = (e: any) => {
		let isUnique = true;

		Object.keys(chartGroup.groups).forEach(grp => {
			if (chartGroup.groups[grp].name == e.target.value) {
				isUnique = false;
			}
		});

		if (isUnique) {
			updateChartFilterGroupsName(group.id, e.target.value)
		}
		else {
			console.error("Group name should be unique.")
			setSeverity("error");
			setOpenAlert(true);
			setTestMessage(
				"Group name should be unique."
			);

			setTimeout(() => {
				setOpenAlert(false);
				//setTestMessage("");
			}, 3000);
		}
	};

	// DropZoneDropItem
	const handleDrop = (item: any, group: any) => {

		if (item.bIndex === 99) {
			const uID = uIdGenerator();
			var fieldData = item.fieldData;
			fieldData.uId = uID;
			updateChartFilterGroupsFilters(selectedDatasetID, group.id, fieldData);

		}
		// if (name === "Filter") {
		// 	setModalData(newFieldData);
		// }
	};

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		setShowPopover(true)
	};

	const handleClose = () => {
		setShowPopover(false)
		setAnchorEl(null);

	};

	const handleCBChange = (event: any) => {
		if (event.target.checked) {
			updateDashBoardSelectedTabTiles(group.id, event.target.id);
		}
		else {
			deleteDashBoardSelectedTabTiles(group.id, selectedGroupTabTilesList.findIndex((id: string) => id == event.target.id));
		}
	}

	let groupsStyle: any = {

		borderBottom: "1px solid black",
		overflowY: "auto",
	}

	if (!group.isCollapsed && group.filters && group.filters.length == 0) {
		groupsStyle["minHeight"] = "300px"
	}

	return (
		<div ref={drop} style={groupsStyle} onDoubleClick={() => setEditGroupName(true)}>
			{editGroupName ?
				<input
					autoFocus
					value={group.name}
					onChange={handleGroupNameValue}
					className="editTabSelected"
					onBlur={() => { setEditGroupName(false) }}
					title="Press enter or click away to save"
				/> : <span>{group.name}</span>}

			<ExpandCollaseIconSwitch />
			{fromDashboard ?
				<button
					type="button"
					className="buttonCommon"
					style={{ backgroundColor: "transparent" }}
					title="More Options"
					onClick={handleClick}
				>
					<MoreVertIcon aria-describedby={id} style={{ fontSize: "16px", color: "#999999" }} onClick={() => handleClick} />
				</button>
				: null}
			<NotificationDialog
				onCloseAlert={() => {
					setOpenAlert(false);
					setTestMessage("");
				}}
				severity={severity}
				testMessage={testMessage}
				openAlert={openAlert}
			/>
			{
				!group.isCollapsed ?
					<>
						{group && group.filters?.map((field: fieldProps, index: number) =>
							<ChartFilterGroupCard
								propKey={propKey}
								name={group.id}
								itemIndex={index}
								key={index}
								field={field}
							/>
						)
						}
					</> : null
			}

			<Popover
				open={showPopover}
				id={id}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				<div className="datasetListPopover">
					<div className="datasetListPopoverHeading">
						<div style={{ flex: 1 }}>{"Dashboard Tiles"}</div>
					</div>
					<div>
						{
							dashboardTabTileList.map((item: any, index: number) => {
								return (
									<label className="UserFilterCheckboxes" key={index}>

										<Checkbox
											checked={selectedGroupTabTilesList.includes(item.id)}
											name={item.name}
											id={item.id}
											style={{
												transform: "scale(0.6)",
												paddingRight: "0px",
											}}
											sx={{
												"&.Mui-checked": {
													color: "orange",
												},

											}}
											onChange={e => handleCBChange(e)}
										/>


										<span
											title={item.name}
											style={{
												marginLeft: 0,
												marginTop: "3.5px",
												justifySelf: "center",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												overflow: "hidden",
											}}
										>
											{item.name}
										</span>
									</label>
								);
							})
						}
					</div>
				</div>
			</Popover>
		</div>
	)

};

const mapStateToProps = (state: ChartPropertiesStateProps & ChartFilterGroupStateProps & TileRibbonStateProps) => {
	return {
		chartProp: state.chartProperties,
		chartGroup: state.chartFilterGroup,
		tileState: state.tileState,
		tabTileProps: state.tabTileProps,
		dashBoardGroup: state.dashBoardFilterGroup,

	};
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
	return {

		updateChartFilterGroupsFilters: (selectedDatasetID: string, groupId: string, filters: any) =>
			dispatch(updateChartFilterGroupsFilters(selectedDatasetID, groupId, filters)),
		updateChartFilterGroupsName: (groupId: string, name: string) =>
			dispatch(updateChartFilterGroupsName(groupId, name)),
		updateChartFilterGroupsCollapsed: (groupId: string, collapsed: boolean) =>
			dispatch(updateChartFilterGroupsCollapsed(groupId, collapsed)),
		updateDashBoardSelectedTabTiles: (groupId: string, selectedTabTiles: any) =>
			dispatch(updateDashBoardSelectedTabTiles(groupId, selectedTabTiles)),
		deleteDashBoardSelectedTabTiles: (groupId: string, groupIndex: number) =>
			dispatch(deleteDashBoardSelectedTabTiles(groupId, groupIndex)),

	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartFilterGroups);