let elementIds = [
    "chkLyrChannel",
    "chkLyrSounding",
    "chkLyrSurface"
]

function addWatch() {
    let clearcheck = setInterval(repeatCheck, 50);
    function repeatCheck(){
        if(avaIFaceJS.mapJS.cbw_func !== undefined){
            clearInterval(clearcheck);
            for(let lyr of elementIds){
                let el = document.getElementById(lyr);
                el.addEventListener('click', avaIFaceJS.mapJS.cbw_func.triggerLayer, false);
            }
            for(let el of document.getElementsByName('surface')){
                el.addEventListener('click', avaIFaceJS.cbw_func.changeSurface, false);
            }
            for(let el of document.getElementsByName("surfDetails")){
                el.hidden = true;
            }
            document.getElementById('surf_combined').hidden = false;
        }
    }
}


function parseDateString(input_date){
    return new Date(
        parseInt(input_date.slice(0, 4)),
        parseInt(input_date.slice(4, 6)),
        parseInt(input_date.slice(6, 8))
    )
}

function toDateString(input_date){
    return input_date.getDate().toString().padStart(2, "0") + "-" + input_date.getMonth().toString().padStart(2, "0") + "-" + input_date.getFullYear().toString();
}

avaIFaceJS.cbw_func = {
    images:[],
    selected_zone:1,

    changeSurface: function(evt) {
        let layerName = evt.target.value;
        document.getElementById("surf_" + layerName).hidden = false;
        document.getElementById("surf_" + avaIFaceJS.mapJS.cbw_func.currentSurface).hidden = true;
        avaIFaceJS.mapJS.cbw_func.changeSurface(layerName);
    },
    setOpacity: function(ev) {
        let newOpacity = Math.max(10, ev.target.value) / 100;
        avaIFaceJS.mapJS.cbw_func.wmts_layers.conformance.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.combined.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.difference.setOpacity(newOpacity);
    },

    init: function() {
        addWatch();
        document.getElementById("surfTrans").addEventListener("input", avaIFaceJS.cbw_func.setOpacity);
        let detailsWindow = document.getElementById("surfaceDetails");
        fetch("/dates.json", {method: "GET"})
            .then(r => r.json())
            .then(r => {
                let curDate = toDateString(parseDateString(r.current_date));
                let prevDate = toDateString(parseDateString(r.compare_date));
                for(let el of document.getElementsByName("srfDateCur")){
                    el.textContent = curDate;
                }
                for(let el of document.getElementsByName("srfDatePrev")){
                    el.textContent = prevDate;
                }
            })
    }
};