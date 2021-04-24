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
                el.addEventListener('click', avaIFaceJS.mapJS.cbw_func.changeSurface, false);
            }
        }
    }
}

avaIFaceJS.cbw_func = {
    images:[],
    selected_zone:1,

    setOpacity: function(ev) {
        let newOpacity = Math.max(10, ev.target.value) / 100;
        avaIFaceJS.mapJS.cbw_func.wmts_layers.conformance.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.combined.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.difference.setOpacity(newOpacity);
    },

    init: function() {
        addWatch();
        document.getElementById("surfTrans").addEventListener("input", avaIFaceJS.cbw_func.setOpacity)
    }
};