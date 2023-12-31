import moment from 'moment';

export function dateFormat(date, format) {
	
	if(date && date !=='' && format && format!==''){
		var cDate = moment(date).format(format);
    	return cDate;
	}else{
		return '-';
	}
}

export function SecondsToDay(value) {
	var seconds = Number(value);
	if(seconds && seconds > 0){
		
		var d = Math.floor(seconds / (3600*24));
		var h = Math.floor(seconds % (3600*24) / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 60);
    	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
		var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
		var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
		var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
		return dDisplay + hDisplay + mDisplay + sDisplay;

	}else{
		return '-';
	}
}