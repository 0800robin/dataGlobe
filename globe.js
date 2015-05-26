    //global variables, controls for camera and renderer definition
    var controls;
    var renderer;

    //function to convert longitude and latitude to 3D vector
    //'pop' value used as a scalar. 
    function latlngToVector(lat, lng, pop) {
        var x, y, z;
        var mul = pop;

        //snapping the values to radians
        var phi = (90 - lat) * (-Math.PI / 180);
        var theta = (180 - lng) * (Math.PI / 180);

        //calculating vector postions, with scale
        x = (mul) * Math.sin(phi) * Math.cos(theta);
        y = (mul) * Math.cos(phi);
        z = (mul) * Math.sin(phi) * Math.sin(theta);

        //returns a THREE Vector, to be used in lines.
        return new THREE.Vector3(x, y, z);
    }


    function setup() {
        //setting renderer size based on window size.
        var width = window.innerWidth * 0.7;
        var height = window.innerHeight;

        //arrays to hold lines and data values
        lines = [];
        city_values = [];

        //renderer with antialias for smoothing
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        //defining the renderer size, and DOM manipulation
        //to display the renderer in the globe div.
        renderer.setSize(width, height);
        container = document.createElement('div');
        container.id = "globeContainer";
        document.body.appendChild(container);
        container.appendChild(renderer.domElement);

        //create the sceme, camera and set up orbit controls
        //for camera interaction
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        //set the camera at a sensible distance away from the globe.
        camera.position.set(0, 0, 6);

        //add general purpose lights that are omnipresent.
        hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.1);
        scene.add(hemisphereLight);
        hemisphereLight.castShadow = true;

        //create the globe, create a sphere, wrap it with the texture.
        var geometry = new THREE.SphereGeometry(2, 150, 150);
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture('img/earthmap_redux.jpg'),
        })

        //define a mesh to act as the glow
        mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true
        mesh.castShadow = true
        scene.add(mesh);

        // simple glowing/ atmosphere effect
        // http://stemkoski.github.io/Three.js/Simple-Glow.html
        // a sprite appears the same from all angles
        var spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.ImageUtils.loadTexture('img/glow.png'),
            useScreenCoordinates: false,
            alignment: THREE.SpriteAlignment.center,
            color: 0xffffff,
            transparent: false,
            blending: THREE.AdditiveBlending
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5.75, 5.75, 1);
        mesh.add(sprite); // scale ad add to a mesh

        // again via stemkoski on github
        // second glow layer, bluer and bigger to
        // emulate a more realistic atmosphere
        var spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.ImageUtils.loadTexture('img/glow.png'),
            useScreenCoordinates: false,
            alignment: THREE.SpriteAlignment.center,
            color: 0x00BFFF,
            transparent: false,
            blending: THREE.AdditiveBlending
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5.25, 5.25, 1);
        mesh.add(sprite);

    }

    //draw function is minimal.
    //clear scene, redraw everything, update the camera controls.
    function draw() {
        scene.clear;
        requestAnimationFrame(draw);
        renderer.render(scene, camera);
        controls.update();
    }

    //setup and render the initial selections and scene.
    setup();
    draw();



    // Jquery to get check when the dropdown menu had been changed
    // call the display value function
    $(document).ready(function() {
        $("select").change(displayValue);
        displayValue();
    });

    // get the value selected from the drop down menu, and pass
    // it to the update line function. 
    function displayValue() {
        var value = $("#city_value").val();
        updateLine(value);
    }


    //some basic arrays to find top/ bottom values in arrays
    function getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray);
    }

    function getMinOfArray(numArray) {
        return Math.min.apply(null, numArray);
    }


    //major function to update the lines
    function updateLine(dataSelect) {

        //clear out the array that holds the data values for each city
        city_values = new Array();

        //find the value selected from the dropdown
        var selectedValue = dataSelect;


        //check if it's a property value
        if (dataSelect == "price_to_income_index" ||
            dataSelect == "rent_centre" ||
            dataSelect == "mort_income" ||
            dataSelect == "rent_outer" ||
            dataSelect == "afford_index" ||
            dataSelect == "yield_centre" ||
            dataSelect == "yield_outer") {

            var selection = dataSelect;

            //if so, fetch the property JSON file 
            //and pass the data and value selectced to redraw function
            $.getJSON("data/property.json", function(data) {
                reDrawLine(data, selection, 'property_data');
            });
        }

        //check if it's a quality of life value
        else if (dataSelect == "quality_of_life_index" ||
            dataSelect == "health_care_index" ||
            dataSelect == "purchasing_index" ||
            dataSelect == "property_ratio_index" ||
            dataSelect == "safety_index" ||
            dataSelect == "cpi_index") {

            var selection = dataSelect;

            //if so, fetch the quality of life JSON file 
            //and pass the data and value selectced to redraw function
            $.getJSON("data/quality_of_life.json", function(data) {
                reDrawLine(data, selection, 'quality_of_life_data');
            });
        }




        //check if it's a traffic value
        else if (dataSelect == "traffic_index" ||
            dataSelect == "time_mins" ||
            dataSelect == "time_index" ||
            dataSelect == "inefficiency_index" ||
            dataSelect == "emission_index") {

            var selection = dataSelect;


            //if so, fetch the traffic JSON file 
            //and pass the data and value selectced to redraw function
            $.getJSON("data/traffic.json", function(data) {
                reDrawLine(data, selection, 'traffic_data');
            });
        }




        //check if it's a cost of living value
        else if (dataSelect == "cpi" ||
            dataSelect == "rent_index" ||
            dataSelect == "cpi_plus_rent" ||
            dataSelect == "groceries_index" ||
            dataSelect == "restaurant_index" ||
            dataSelect == "local_purchasing_power_index") {

            var selection = dataSelect;


            //if so, fetch the cost of living JSON file 
            //and pass the data and value selectced to redraw function
            $.getJSON("data/cost_of_living.json", function(data) {
                reDrawLine(data, selection, 'living_data');
            });
        }

        //no other options available
        else {

        }

    }


    //major function for redrawing lines on the globe
    function reDrawLine(_data, _selection, _arrayName) {
        //load in the data, selection and arrayname in JSON specifications 
        var data = _data;
        var selection = _selection;
        var arrayName = _arrayName;

        //remove all current lines from the scene
        //this is because some data sets are of different size to others
        for (var i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
        //clear the lines array
        lines = [];

        //write the data description information from the JSON data with correct selection ID
        document.getElementById('info').innerHTML = ("<h3>" + data[selection] + "</h3>");

        //create colour check tag name.
        var check = selection + "_check";

        //for every item in the JSON array, push a parsed float to the city
        //values array based on user selection.
        for (item in data[arrayName]) {
            city_values.push(parseFloat(data[arrayName][item][selection]));

            //for each value, create a new geometery
            //ensure colours and size can be updated
            var geometry = new THREE.Geometry();
            geometry.verticesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;
            geometry.dynamic = true;

            //start at 0,0,0.
            geometry.vertices.push(new THREE.Vector3(0, 0, 0));

            //create a new 3D vector, based on items latitude and longitude. Uniformly scaled to 2.1
            var newline = latlngToVector(data[arrayName][item].lat, data[arrayName][item].lng, 2.1);
            geometry.vertices.push(newline);

            //colour it white to begin with, add some width to the line
            var material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 4
            });

            //define the geometry and matieral as a arguments for a new Line object.
            var line = new THREE.Line(geometry, material);

            //push it to the lines array
            lines.push(line);

        }

        //find the max and min values of all the data for the specific choice
        var max = getMaxOfArray(city_values);
        var min = getMinOfArray(city_values);

        //find the range
        var OldRange = (max - min);

        //specify new range for scaling the lines in 3D space
        var NewRange = (1.3 - 0.98);

        //specify new range for colouring (rgb values between 0 and 1)
        var colRangeNew = (1 - 0.01);


        for (var i = 0; i < city_values.length; i++) {

            //for every value in the city array
            //create a scaled number based on the orignal value
            //scale the relevant line in the lines array.
            var feed = city_values[i];
            var scaled = (((city_values[i] - min) * NewRange) / OldRange) + 1;
            lines[i].scale.set(scaled, scaled, scaled);

            //make a new var based on orginal data value to use to pick colours.
            //then set the relevant line the correct colour.  
            var colScale = (((city_values[i] - min) * colRangeNew) / OldRange);

            //if the check is true, it means that a high value is good, so high values
            //should be coloured green, so set high scale to the green arument. 
            if (data[check]) {
                lines[i].material.color.setRGB(0.2 + (1 - (2 * colScale)), 0.2 + (colScale), 0.2);

            } else {
                //else if it's false, it means that a high value is bad, so high values
                //should be coloured red, so set high scale to the red arument. 
                lines[i].material.color.setRGB(0.2 + (colScale), 0.2 + (1 - (2 * colScale)), 0.2);
            }
            //finally add all the lines to the scene. 
            scene.add(lines[i]);
        }
    }