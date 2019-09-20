hspeed = (RightPressed - LeftPressed) * spd;
vspeed = (DownPressed - UpPressed) * spd;
if(hspeed !=0 || vspeed !=0){
if(spd>=4){spd=4;}
else
{spd+=0.15;}
WalkIndex = direction/(360/8);
image_speed=imgspeed;
sprite_index = WalkSprite[WalkIndex];
}
else if(hspeed=0 && vspeed=0){
spd=0.15;
image_speed=0;
sprite_index=PlayerIdle;
image_index=direction/(360/image_number)
}
lastdir = direction;
