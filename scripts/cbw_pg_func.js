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

    init: function() {
        addWatch()
    }
};