//general
var timeScale = 1;

// 2D rendering var
var canvas;
var viewportHeight = 4

// Renderer vars
var renderMode = '3D';

var camera, scene, renderer;
var meshes, floor;

// camera vars
var camTheta = 0, camPhi = .4, camRadius = 4;

//mouse vars
var isMouseDown = false, onMouseDownTheta, onMouseDownPhi, onMouseDownPosition;

var juggler, lastUpdatedTime;

function buildPropInputs() {
	$('#propInputs').empty();
	$('#propSelector').empty();
	for (i = 0; i < getNumberOfProps($('#siteswap').val()); i++) {
		$('#propSelector').append('<option value="' + i + '">Prop ' + (i+1) + '</option>');
		$('#propInputs').append('<div id="propInputIx' + i + '">\
			<div class="form-inline"><span class="span1">Type</span><select id="propType' + i + '" class="span2"><option value="ball">ball</option><option value"club">club</option></select></div>\
			<div class="form-inline"><span class="span1">Radius</span><input id="propRadius' + i + '" type="text" class="span1" value=".05"></input></div>\
			<div class="form-inline"><span class="span1">C</span><input id="propC' + i + '" type="text" class="span1" value=".95"></input></div>\
		</div>');
	}
	//hide all prop inputs except the 1st
	$("[id^=propInputIx]").addClass("hidden");
	$("#propInputIx0").removeClass("hidden");
}

function buildThrowInputs() {
	$('#throwInputs').empty();
	$('#throwSelector').empty();
	for (i = 0; i < $('#siteswap').val().length; i++) {
		$('#throwSelector').append('<option value="' + i + '">Throw ' + (i+1) + '</option>');
		$('#throwInputs').append('<div id="throwInputIx' + i + '">\
			<div class="form-inline"><span class="span1">Dwell</span><input id="throwLeftDwellDuration' + i + '" type="text" class="span1" value=".2"></input><input id="throwRightDwellDuration' + i + '" type="text" class="span1" value=".2"></input></div>\
			<div class="form-inline"><span class="span1">Bounces</span><input id="throwLeftBounces' + i + '" type="text" class="span1" value="0"></input><input id="throwRightBounces' + i + '" type="text" class="span1" value="0"></input></div>\
			<div class="form-inline"><span class="span1">Force</span><input id="throwLeftForce' + i + '" type="checkbox" class="span1"></input><input id="throwRightForce' + i + '" type="checkbox" class="span1"></input></div>\
			<div class="form-inline"><span class="span1">Center</span><input id="throwLeftCenter' + i + '" type="text" class="span1" value="-.2,1,0"></input><input id="throwRightCenter' + i + '" type="text" class="span1" value=".2,1,0"></input></div>\
			<div class="form-inline"><span class="span1">Radius</span><input id="throwLeftRadius' + i + '" type="text" class="span1" value=".1"></input><input id="throwRightRadius' + i + '" type="text" class="span1" value=".1"></input></div>\
			<div class="form-inline"><span class="span1">&theta; Catch</span><input id="throwLeftThetaCatch' + i + '" type="text" class="span1" value="3.14"></input><input id="throwRightThetaCatch' + i + '" type="text" class="span1" value="0"></input></div>\
			<div class="form-inline"><span class="span1">&theta; Throw</span><input id="throwLeftThetaThrow' + i + '" type="text" class="span1" value="0"></input><input id="throwRightThetaThrow' + i + '" type="text" class="span1" value="3.14"></input></div>\
			<div class="form-inline"><span class="span1">CCW</span><input id="throwLeftCCW' + i + '" type="checkbox" class="span1" checked></input><input id="throwRightCCW' + i + '" type="checkbox" class="span1"></input></div>\
		</div>');
	}
	//hide all throw inputs except the 1st
	$("[id^=throwInputIx]").addClass("hidden");
	$("#throwInputIx0").removeClass("hidden");
}

function refreshPropInputs() {
	//hide all props except the selected one
	$("[id^=propInputIx]").addClass("hidden");
	$("#propInputIx" + $('#propSelector').val()).removeClass("hidden");
}

function refreshThrowInputs() {
	//hide all props except the selected one
	$("[id^=throwInputIx]").addClass("hidden");
	$("#throwInputIx" + $('#throwSelector').val()).removeClass("hidden");
}

function go() {

	var siteswap = $('#siteswap').val();

	if (validateSiteswap(siteswap)) {

		$('#errorMessages').hide();

		// if the first character is a parentheses, the pattern is synchronous, else its not
		var sync = (siteswap[0] == "(" ? true : false);

		var pattern = {beatDuration: parseFloat($('#beatDuration').val()), sync: sync, throws: []};

		var siteswapArray = (sync ? siteswap.slice(1,siteswap.length-1).split(")(") : siteswap.split(''));

		for (var i = 0; i < siteswapArray.length; i++) {
			var s = siteswapArray[i];

			pattern.throws.push(
					[
						{
							siteswap: (sync ? s.split(",")[0] : s),
							bounces: parseInt($('#throwLeftBounces' + i).val()),
							forceBounce: $('#throwLeftForce' + i).is(':checked'),
							rotations: {x: 2, y:0, z:0 },
							catchRotation: {x:3*Math.PI/2, y:0, z:0},
							throwRotation: {x:3*Math.PI/2-.5, y:0, z:0},
							dwellDuration: parseFloat($('#throwLeftDwellDuration' + i).val()),
							dwellPath:
								{
									type: "circular",
									center: {x: parseFloat($('#throwLeftCenter' + i).val().split(',')[0]), y: parseFloat($('#throwLeftCenter' + i).val().split(',')[1]), z: parseFloat($('#throwLeftCenter' + i).val().split(',')[2])},
									radius: parseFloat($('#throwLeftRadius' + i).val()),
									thetaCatch: parseFloat($('#throwLeftThetaCatch' + i).val()),
									thetaThrow: parseFloat($('#throwLeftThetaThrow' + i).val()),
									ccw: $('#throwLeftCCW' + i).is(':checked'),
									/*type: "linear",
									path: 
										[
											{x: .3, y: 1, z: 0},
											{x: .2, y: 1, z: 0},
											{x: .1, y: 1, z: 0}
										]*/
								}
						},
						{
							siteswap: (sync ? s.split(",")[1] : s),
							bounces: parseInt($('#throwRightBounces' + i).val()),
							forceBounce: $('#throwRightForce' + i).is(':checked'),
							rotations: {x: 2, y:0, z:0 },
							catchRotation: {x:3*Math.PI/2, y:0, z:0},
							throwRotation: {x:3*Math.PI/2-.5, y:0, z:0},
							dwellDuration: parseFloat($('#throwRightDwellDuration' + i).val()),
							dwellPath:
								{
									type: "circular",
									center: {x: parseFloat($('#throwRightCenter' + i).val().split(',')[0]), y: parseFloat($('#throwRightCenter' + i).val().split(',')[1]), z: parseFloat($('#throwRightCenter' + i).val().split(',')[2])},
									radius: parseFloat($('#throwRightRadius' + i).val()),
									thetaCatch: parseFloat($('#throwRightThetaCatch' + i).val()),
									thetaThrow: parseFloat($('#throwRightThetaThrow' + i).val()),
									ccw: $('#throwRightCCW' + i).is(':checked')
								}
						}
					]
				);
		}

		var props = [];
		$("[id^=propInputIx]").each(function (index) { 
			props.push({
				radius: parseFloat($(this).find("[id^=propRadius]").val()),
				C: parseFloat($(this).find("[id^=propC]").val()),
				type: $(this).find("[id^=propType]").find(":selected").val()
			});
		});

		juggler = new Juggler(pattern,props);
		juggler.init();

		lastUpdatedTime = 0;

		animate();

	} else {

		$('#errorMessages').text("Invalid siteswap");
		$('#errorMessages').show();

	}
}

function zoom(zoomIn) {
	viewportHeight += ( zoomIn ? -.1 : .1);
	camRadius += ( zoomIn ? -.1 : .1);
}

function adjustSpeed(slowDown) {
	timeScale += (slowDown ? -.1 : .1);
}

function drawScene2D(juggler) {
	
	if (lastUpdatedTime == 0) {
		var $container = $('#canvasContainer');
		$container.empty();
		$container.append('<canvas id="myCanvas" style="border-width:1px;border-color:black;border-style:solid;"></canvas>')[0];
		canvas = $('#myCanvas')[0]
	}

	canvas.height = $(window).height()-100;
	canvas.width = $('#canvasContainer').width();
	var context = canvas.getContext('2d');

	// clear
	context.clearRect(0, 0, canvas.width, canvas.height);

	// update
	var scale = canvas.height/viewportHeight;

	juggler.props.map(function(prop) {
		if (prop.active) {
			context.beginPath();
			context.arc(canvas.width/2+prop.position.x*scale,canvas.height-prop.position.y*scale,prop.radius*scale,0,2*Math.PI);
			context.fillStyle = prop.color;
			context.fill();
		}
	});

}

function drawScene3D(juggler) {
	if (lastUpdatedTime == 0) {

		var $container = $('#canvasContainer');
		var width = $('#canvasContainer').width(), height = $(window).height()-100;

		camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
		camera.position.x = camRadius * Math.sin( camTheta ) * Math.cos( camPhi );
		camera.position.y = camRadius * Math.sin( camPhi );
		camera.position.z = camRadius * Math.cos( camTheta ) * Math.cos( camPhi );

		camera.lookAt(new THREE.Vector3(0,1,0));

		scene = new THREE.Scene();

		meshes = [];
		juggler.props.map(function(prop) {

			if (prop.type == "ball") {
				mesh = new THREE.Mesh( new THREE.SphereGeometry( prop.radius ), 
				new THREE.MeshBasicMaterial( { color: prop.color, wireframe: true } ) );
			} else if (prop.type == "club") {
				var geometry1 = new THREE.CylinderGeometry( .02, .015, .2, 5, 4 );
				var geometry2 = new THREE.CylinderGeometry( .04, .02, .18, 5, 4 );
				geometry2.vertices.map(function(v) { v.y += .19 });
				THREE.GeometryUtils.merge(geometry1, geometry2);
				var geometry3 = new THREE.CylinderGeometry( .02, .04, .15, 5, 4 );
				geometry3.vertices.map(function(v) { v.y += .355 });
				THREE.GeometryUtils.merge(geometry1, geometry3);
				var geometry4 = new THREE.CylinderGeometry( .015, .02, .02, 5, 4 );
				geometry4.vertices.map(function(v) { v.y -= .11 });
				THREE.GeometryUtils.merge(geometry1, geometry4);
				geometry1.vertices.map(function(v) { v.y -= .19 }); // move whole club a bit so that center is the fattest point
				var material = new THREE.MeshBasicMaterial( { color: prop.color, wireframe: true } );
				mesh = new THREE.Mesh( geometry1, material );				
			
			}

			mesh.position.x = prop.position.x;
			mesh.position.y = prop.position.y;
			mesh.position.z = prop.position.z;

			mesh.rotation.x = prop.rotation.x;
			mesh.rotation.y = prop.rotation.y;
			mesh.rotation.z = prop.rotation.z;

			scene.add( mesh );
			meshes.push(mesh);

		});

		floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 3, 3), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ));
		floor.rotation.x += 3*Math.PI/2
		scene.add(floor);

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( width, height );

		$container.empty();
		$container.append(renderer.domElement);

		//add the event listeners for mouse interaction
		renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
		renderer.domElement.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
		
		onMouseDownPosition = new THREE.Vector2();

	} else {

		//update prop positions
		for (var i = 0; i < juggler.props.length; i++) {
			meshes[i].position.x = juggler.props[i].position.x;
			meshes[i].position.y = juggler.props[i].position.y;
			meshes[i].position.z = juggler.props[i].position.z;

			meshes[i].rotation.x = juggler.props[i].rotation.x;
			meshes[i].rotation.y = juggler.props[i].rotation.y;
			meshes[i].rotation.z = juggler.props[i].rotation.z;
            
		}	

		///update camera
		camera.position.x = camRadius * Math.sin( camTheta ) * Math.cos( camPhi );
		camera.position.y = camRadius * Math.sin( camPhi );
		camera.position.z = camRadius * Math.cos( camTheta ) * Math.cos( camPhi );

		camera.lookAt(new THREE.Vector3(0,1,0));	
		
		
	
	}

	renderer.render( scene, camera );

}

function animate() {	

	var now = (new Date()).getTime();
	var dt = (now - lastUpdatedTime) / 1000 * timeScale;

	if (dt > .05) {
		dt = .05;
	}

	juggler.update(dt);

	if (renderMode == '2D') {
		drawScene2D(juggler);
	} else if (renderMode == '3D') {
		drawScene3D(juggler);
	}

	lastUpdatedTime = now;

	requestAnimationFrame(function() { animate(); });	
	
}

//got the camera rotation code from: http://www.mrdoob.com/projects/voxels/#A/
function onDocumentMouseDown( event ) {
	isMouseDown = true;
	onMouseDownTheta = camTheta;
	onMouseDownPhi = camPhi;
	onMouseDownPosition.x = event.clientX;
	onMouseDownPosition.y = event.clientY;
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	if ( isMouseDown ) {
		camTheta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.01 ) + onMouseDownTheta;
		
		var dy = event.clientY - onMouseDownPosition.y;
		//TODO: update this so the camera can't cross the pole
		camPhi = ( ( dy ) * 0.01 ) + onMouseDownPhi;
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	isMouseDown = false;
}

function onDocumentMouseWheel( event ) {
	camRadius -= event.wheelDeltaY*.01;
}

/* the following runs on page load */

buildPropInputs();
buildThrowInputs();
go();