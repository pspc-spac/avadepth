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
    surfaceLayers: [
        {
            "name": "combined",
            legend: {
                en: '<table><tbody><tr><th>Depth</th><th>Colour</th></tr>' +
                    '<tr><td>0</td><td><div class="surface_legend" style="background-color:#980056"></div></td></tr>' +
                    '<tr><td>1.8</td><td><div class="surface_legend" style="background-color:#fe0000"></div></td></tr>' +
                    '<tr><td>8.2</td><td><div class="surface_legend" style="background-color:#ffff00"></div></td></tr>' +
                    '<tr><td>13.3</td><td><div class="surface_legend" style="background-color:#00ff00"></div></td></tr>' +
                    '<tr><td>16.9</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>21.8</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>25</td><td><div class="surface_legend" style="background-color:#74007a"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>profondeur</th><th>couleur</th></tr>' +
                    '<tr><td>0</td><td><div class="surface_legend" style="background-color:#980056"></div></td></tr>' +
                    '<tr><td>1.8</td><td><div class="surface_legend" style="background-color:#fe0000"></div></td></tr>' +
                    '<tr><td>8.2</td><td><div class="surface_legend" style="background-color:#ffff00"></div></td></tr>' +
                    '<tr><td>13.3</td><td><div class="surface_legend" style="background-color:#00ff00"></div></td></tr>' +
                    '<tr><td>16.9</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>21.8</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>25</td><td><div class="surface_legend" style="background-color:#74007a"></div></td></tr>' +
                    '</tbody></table>',
            }
        },
        {
            "name": "conformance",
            legend: {
                en: '<table><tbody><tr><th>Rating</th><th>Colour</th></tr>' +
                    '<tr><td>-20 - -1</td><td><div class="surface_legend" style="background-color:#ff9632"></div></td></tr>' +
                    '<tr><td>-1 - -0.5</td><td><div class="surface_legend" style="background-color:#ffc832"></div></td></tr>' +
                    '<tr><td>-0.5 - 0</td><td><div class="surface_legend" style="background-color:#fff56e"></div></td></tr>' +
                    '<tr><td>0 - 0.5</td><td><div class="surface_legend" style="background-color:#82e6ff"></div></td></tr>' +
                    '<tr><td>0.5 - 1</td><td><div class="surface_legend" style="background-color:#5ac8fa"></div></td></tr>' +
                    '<tr><td>1 - 1.5</td><td><div class="surface_legend" style="background-color:#324bff"></div></td></tr>' +
                    '<tr><td>1 - 20</td><td><div class="surface_legend" style="background-color:#969696"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>valeur</th><th>couleur</th></tr>' +
                    '<tr><td>-20 - -1</td><td><div class="surface_legend" style="background-color:#ff9632"></div></td></tr>' +
                    '<tr><td>-1 - -0.5</td><td><div class="surface_legend" style="background-color:#ffc832"></div></td></tr>' +
                    '<tr><td>-0.5 - 0</td><td><div class="surface_legend" style="background-color:#fff56e"></div></td></tr>' +
                    '<tr><td>0 - 0.5</td><td><div class="surface_legend" style="background-color:#82e6ff"></div></td></tr>' +
                    '<tr><td>0.5 - 1</td><td><div class="surface_legend" style="background-color:#5ac8fa"></div></td></tr>' +
                    '<tr><td>1 - 1.5</td><td><div class="surface_legend" style="background-color:#324bff"></div></td></tr>' +
                    '<tr><td>1 - 20</td><td><div class="surface_legend" style="background-color:#969696"></div></td></tr>' +
                    '</tbody></table>'
            }
        },
        {
            "name": "difference",
            legend: {
                en: '<table><tbody><tr><th>Rating</th><th>Colour</th></tr>' +
                    '<tr><td>-20 - -0.8</td><td><div class="surface_legend" style="background-color:#ff0000"></div></td></tr>' +
                    '<tr><td>-0.8 - -0.6</td><td><div class="surface_legend" style="background-color:#008040"></div></td></tr>' +
                    '<tr><td>-0.6 - -0.4</td><td><div class="surface_legend" style="background-color:#808040"></div></td></tr>' +
                    '<tr><td>-0.4 - -0.2</td><td><div class="surface_legend" style="background-color:#ff8000"></div></td></tr>' +
                    '<tr><td>-0.2 - -0.1</td><td><div class="surface_legend" style="background-color:#e8e800"></div></td></tr>' +
                    '<tr><td>-0.1 - 0.1</td><td><div class="surface_legend" style="background-color:#c0c0c0"></div></td></tr>' +
                    '<tr><td>0.1 - 0.2</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>0.2 - 0.4</td><td><div class="surface_legend" style="background-color:#0080ff"></div></td></tr>' +
                    '<tr><td>0.4 - 0.6</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>0.6 - 0.8</td><td><div class="surface_legend" style="background-color:#ff00ff"></div></td></tr>' +
                    '<tr><td>0.8 - 20</td><td><div class="surface_legend" style="background-color:#8000ff"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>valeur</th><th>couleur</th></tr>' +
                    '<tr><td>-20 - -0.8</td><td><div class="surface_legend" style="background-color:#ff0000"></div></td></tr>' +
                    '<tr><td>-0.8 - -0.6</td><td><div class="surface_legend" style="background-color:#008040"></div></td></tr>' +
                    '<tr><td>-0.6 - -0.4</td><td><div class="surface_legend" style="background-color:#808040"></div></td></tr>' +
                    '<tr><td>-0.4 - -0.2</td><td><div class="surface_legend" style="background-color:#ff8000"></div></td></tr>' +
                    '<tr><td>-0.2 - -0.1</td><td><div class="surface_legend" style="background-color:#e8e800"></div></td></tr>' +
                    '<tr><td>-0.1 - 0.1</td><td><div class="surface_legend" style="background-color:#c0c0c0"></div></td></tr>' +
                    '<tr><td>0.1 - 0.2</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>0.2 - 0.4</td><td><div class="surface_legend" style="background-color:#0080ff"></div></td></tr>' +
                    '<tr><td>0.4 - 0.6</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>0.6 - 0.8</td><td><div class="surface_legend" style="background-color:#ff00ff"></div></td></tr>' +
                    '<tr><td>0.8 - 20</td><td><div class="surface_legend" style="background-color:#8000ff"></div></td></tr>' +
                    '</tbody></table>'
            }
        }
    ],

    changeSurface: function(evt) {
        let layerName = evt.target.value;
        document.getElementById("surf_" + layerName).hidden = false;
        document.getElementById("surf_" + avaIFaceJS.mapJS.cbw_func.currentSurface).hidden = true;
        let legend = avaIFaceJS.cbw_func.surfaceLayers.find(r => r.name === layerName).legend[page_lang];
        document.getElementById("surfLegend").innerHTML = legend;
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
        document.getElementById("surfLegend").innerHTML = avaIFaceJS.cbw_func.surfaceLayers.find(r => r.name === "combined").legend[page_lang];
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