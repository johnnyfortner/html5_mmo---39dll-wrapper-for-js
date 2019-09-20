if(hspeed < 0 && CollisionTile(10000,LeftPressed,4)){
    x = x - (x mod hoffs) - (bbox_left - x);
    clearbuffer();
    writebyte(13);
    writeshort(global.myid);
    writeshort(x);
    writeshort(y);
    writeshort(lastdir);
    sendinput(global.tcp);
}
if(hspeed > 0 && CollisionTile(10000,RightPressed,4)){
    x = x -(x mod hoffs)+(hoffs-1) -(bbox_right - x);
    clearbuffer();
    writebyte(14);
    writeshort(global.myid);
    writeshort(x);
    writeshort(y);
    writeshort(lastdir);
    sendinput(global.tcp);
}
if(vspeed < 0 && CollisionTile(10000,UpPressed,4)){
    y = y - (y mod voffs) -(bbox_top - y);
    clearbuffer();
    writebyte(15);
    writeshort(global.myid);
    writeshort(x);
    writeshort(y);
    writeshort(lastdir);
    sendinput(global.tcp);
}
if(vspeed > 0 && CollisionTile(10000,DownPressed,4)){
    y = y - (y mod voffs)+(voffs-1) -(bbox_bottom - y);
    clearbuffer();
    writebyte(16);
    writeshort(global.myid);
    writeshort(x);
    writeshort(y);
    writeshort(lastdir);
    sendinput(global.tcp);
}
