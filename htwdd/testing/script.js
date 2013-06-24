$(document).ready(function(){
    $('#mainnavtop li').hover(function(){
    	$('ul',this).stop().height('auto').slideDown(150);
    }, function(){
    	$('ul',this).stop().slideUp(150);
    });
});


function room_fillwithtext() {
				var c=document.getElementById("room1");
				var ctx=c.getContext("2d");
				ctx.font="30px Arial";
				ctx.fillText("Hello World",10,50);
			}
			function room_allowDrop(ev)
			{
				ev.preventDefault();
			}
			function room_drag(ev)
			{
				ev.dataTransfer.setData("Text",ev.target.id);
			}
			function room_drop(ev)
			{
				ev.preventDefault();
				var data=ev.dataTransfer.getData("Text");
				ev.target.appendChild(document.getElementById(data));
			}