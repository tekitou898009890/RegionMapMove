//=============================================================================
// RegionMapMove.js  2023/08/09
// The MIT License (MIT)
//=============================================================================

/*:
 * @plugindesc マップ移動用プラグイン
 * @author aaaa 
 * 
 * @param コモンイベント
 * @desc 移動処理のコモンイベントの番号
 * @default 20
 * @type int
 * 
 * @param id 
 * @desc mapIdを保存する変数番号。場所移動時に使用。
 * @default 18
 * @type int
 *
 * @param x
 * @desc y座標を保存する変数番号。場所移動時に使用。
 * @default 19 
 * @type int
 * 
 * @param y
 * @desc y座標を保存する変数番号。場所移動時に使用。
 * @default 20
 * @type int
 *   
 * @help このプラグインは場所移動設定を効率化します。
 * 
 *  # RegionMapMove
 * 
 * ## 使い方：
 * 
 * 1.　マップの移動させたいタイルにリージョンタイルを置く
 * 2.　飛び先のマップに同じ数値のリージョンタイルを置く
 * 
 * このとき、飛び先マップは必ずマップツリー内で移動元の1個下
 * の階層においてください。
 * 
 * このプラグインは階層関係から移動先を算出するので、階層関係
 * にないツリー構造を超えた移動をする際は通常の場所移動コマン
 * ドを使用してください。
 * 
 * 3.　各リージョンタイルに空イベントを配置してください。
 * 
 * 移動する際に、空イベントが置いてある地点にプレイヤーキャラ
 * が飛ぶようになっています。
 * 
 * 4. セーブしてdataフォルダと同じ階層にRegionMapMove.pyを
 * 配置して実行
 * 
 * dataのMapファイルからregionとイベント位置を読み取って飛び
 * 先を算出して、RegionMapMove.jsonとして保存します。
 * 
 * 保存されたRegionMapMove.jsonはこのプラグインで読み込まれ
 * て、飛ぶ際に値を参照して変数に保存する仕組みになっています。
 * 
 * 5. プラグインパラメータで移動するためのコモンイベント番号
 * を設定
 * 
 * コモンイベントで飛べるようにすることで飛ぶ前後に演出を追加
 * できます。
 * 
 * 6. 番号にあるコモンイベントにおいて場所移動->変数で指定か
 * らパラメータで定めた番号の変数を代入
 * 
 * 初期値であれば18,19,20番がそれぞれID,X,Yなので、上から順
 * に設定していけば使用できます。
 * 
 * 7. 後は動かすだけ
 * 
 * 
 * マップ移動設定する際にツリー構造を参照して接続されている
 * マップのregionを辿って移動出来るようにします。
 * ツリー構造を超えた移動をする際は通常の場所移動コマンドを使
 * 用してください。
 * 
 * ※このプラグインにはプラグインコマンドはありません。
 */

'use strict';

var parameters = PluginManager.parameters('RegionMapMove')
let safety = (name, def_value) => {
    let value = parameters[name];
    return (value === undefined) ? def_value : value;
};
var commonEvent = Number(safety('コモンイベント', '20'));
var idvar = Number(safety('id', '18'));
var xvar = Number(safety('x', '19'));
var yvar = Number(safety('y', '20'));

var $tekitou = null;
var $RegionMapMove = null;

(function(_global) {
    
    var N = 'RegionMapMove';
    var mapHierarchy = {};

    // ここにプラグイン処理を記載

    var filename = 'RegionMapMove.json'

    DataManager.loadDataFile('$RegionMapMove',filename);

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        var ret = _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (command == N) {
            if (args[0] == "load") {
                DataManager.loadDataFile('$RegionMapMove',filename);

            }
        }

        return ret;
        
    };

    function onPlayerMoveComplete(){
        var x = $gamePlayer.x;
        var y = $gamePlayer.y;

        var regionId = $gameMap.regionId(x,y);
        if (regionId > 0){
            var keyExists = regionId in $RegionMapMove[$gameMap._mapId]
            if (keyExists){
                console.log("regionId:" + regionId);
                $gameVariables.setValue(idvar,$RegionMapMove[$gameMap._mapId][regionId]['id']);
                $gameVariables.setValue(xvar,$RegionMapMove[$gameMap._mapId][regionId]['x']);
                $gameVariables.setValue(yvar,$RegionMapMove[$gameMap._mapId][regionId]['y']);
                $gameTemp.reserveCommonEvent(commonEvent);
            }

        } else {
            console.log("regionId is 0");
        }
    }

    var _Game_Player_prototype_updateMove = Game_Player.prototype.updateMove;
    Game_Player.prototype.updateMove = function(){
        _Game_Player_prototype_updateMove.call(this)
        if (this.isStopping()){
            if (this._stopCount === 0) {
                onPlayerMoveComplete();
            }
        }
    }

})(this);


