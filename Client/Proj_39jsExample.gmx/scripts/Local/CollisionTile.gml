switch argument1
{

case LeftPressed:
    for (tile=bbox_top;tile<=bbox_bottom;tile+=6)
        if tile_exists(tile_layer_find(argument0,bbox_left-argument2,tile))
            if tile_get_background(tile_layer_find(argument0,bbox_left-argument2,tile))=0
            {
                hoffs=tile_get_width(tile_layer_find(argument0,bbox_left-argument2,tile));
                return 1;
                break;
            }
    break;

case RightPressed:
    for (tile=bbox_top;tile<=bbox_bottom;tile+=6)
        if tile_exists(tile_layer_find(argument0,bbox_right+argument2,tile))
            if tile_get_background(tile_layer_find(argument0,bbox_right+argument2,tile))=0
            {
                hoffs=tile_get_width(tile_layer_find(argument0,bbox_right+argument2,tile));
                return 1;
                break;
            }
    break;
           
case UpPressed:
    for (tile=bbox_left;tile<=bbox_right;tile+=6)
        if tile_exists(tile_layer_find(argument0,tile,bbox_top-argument2))
            if tile_get_background(tile_layer_find(argument0,tile,bbox_top-argument2))=0
            {
                voffs=tile_get_height(tile_layer_find(argument0,tile,bbox_top-argument2));
                return 1;
                break;
            }
    break;

case DownPressed: 
    for (tile=bbox_left;tile<=bbox_right;tile+=6)
        if tile_exists(tile_layer_find(argument0,tile,bbox_bottom+argument2))
            if tile_get_background(tile_layer_find(argument0,tile,bbox_bottom+argument2))=0
            {
                voffs=tile_get_height(tile_layer_find(argument0,tile,bbox_bottom+argument2));
                return 1;
                break;
            }
    break;
}
