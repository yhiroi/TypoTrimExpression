(function TypoExpressionTrim(thisObj) {
  // TypoExpressionTrim
  // 文字シェイプに「パスのトリミング」属性を追加し、対応するエクスプレッションを記述する
  // (c) eau. / La Mer Artworks 2020
  // http://lamer-e.tv

  // Globals
  var TypoExpressionSimpleData = new Object();
  TypoExpressionSimpleData.scriptName = "TypoExpressionTrim";

  function TypoExpressionTrim_doIt() {
    var comp = app.project.activeItem;

    // 例外処理
    // - アクティブなコンポジションが無ければ終了
    if (comp === null || !(comp instanceof CompItem)) return;

    // - 選択したレイヤーの数が0ならば終了
    if (comp.selectedLayers.length === 0) return;

    // コンポパネルが最前面であることを確認
    comp.openInViewer();

    // 選択したシェイプレイヤーのコピーを保存
    var selLayers = new Array();
    for (var i = comp.numLayers; i > 0; i--) {
      if (comp.layer(i).selected && comp.layer(i) instanceof ShapeLayer) {
        selLayers[selLayers.length] = comp.layer(i);
        selLayers[selLayers.length - 1].selected = false; // deselect layers as we process them
      }
    }

    app.beginUndoGroup(TypoExpressionSimpleData.scriptName);

    //  Main Commands Start
    // ******************************************

    // 現在のコンポにControllerがない場合、作成する
    // - コンポから目的とするControllerの名前を検索し、フラグを立てる
    var isPartsCtlIn = false;
    for (var i = 1; i < comp.numLayers; i++) {
      var name = comp.layer(i).name;
      if (name.indexOf("PartsController") > -1) isPartsCtlIn = true;
    }

    // パーツレベルコントローラ(PartsController)が存在しない場合、作成する
    if (!isPartsCtlIn) {
      var partsCtl = comp.layers.addNull();
      partsCtl.name = "PartsController";
      partsCtl.threeDLayer = true;
      partsCtl.collapseTransformation = true;

      // エクスプレッションに紐付けるスライダーをコントローラに追加する
      // - パスのトリミング:イージング
      var trimRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      trimRatio.name = "Trim_ratio(%)";
      trimRatio["スライダー"].setValue(100);

      // コンポの先頭にレイヤーを移動
      partsCtl.moveToBeginning();
    }

    // 選択レイヤー（パーツ）を1つずつ処理する
    for (var i = 0; i < selLayers.length; i++) {
      var l = selLayers[i];
      l.selected = true;

      try {
        // レイヤーが「パスのトリミング」プロパティを持っているか？
        // 持っていなければ追加
        var l_trim = l
          .property("ADBE Root Vectors Group")
          .property("ADBE Vector Filter - Trim");

        if (l_trim == null) {
          l_trim = l
            .property("ADBE Root Vectors Group")
            .addProperty("ADBE Vector Filter - Trim");
        }

        // パスのトリミング
        // - パスの終点 : 0%→100%へのイージングをヌルレイヤーで管理
        l_trim.end.expression =
          "seedRandom(1, true); \n" +
          'thisComp.layer("PartsController").effect("Trim_ratio(%)")("スライダー").valueAtTime(time-inPoint);';

        // パスに線を追加
        var l_line = l
          .property("ADBE Root Vectors Group")
          .property("ADBE Vector Group")
          .property("ADBE Vectors Group")
          .property("ADBE Vector Graphic - Stroke");
        l_line.enabled = true;
        l_line.property("ADBE Vector Stroke Width").setValue(1);

        // パスのトリミングに紐づくスライダー制御が100以下か否かで、線の表示を切り替える
        // (線の不透明度の値をエクスプレッションで制御)
        l_line.property("ADBE Vector Stroke Opacity").expression =
          'var trim_ratio = thisComp.layer("PartsController").effect("Trim_ratio(%)")("スライダー").valueAtTime(time-inPoint); \n' +
          "if (trim_ratio <= 100) { \n" +
          "\t opacity = 100;\n" +
          "} else { \n" +
          "\t	opacity = 0;\n" +
          "}";

        // パスに塗りを追加
        var l_fill = l
          .property("ADBE Root Vectors Group")
          .property("ADBE Vector Group")
          .property("ADBE Vectors Group")
          .property("ADBE Vector Graphic - Fill");
        l_fill.enabled = true;

        // パスのトリミングに紐づくスライダー制御が100を超えるか否かで、塗りの表示を切り替え
        // (塗りの不透明度の値をエクスプレッションで制御)
        l_fill.property("ADBE Vector Fill Opacity").expression =
          'var trim_ratio = thisComp.layer("PartsController").effect("Trim_ratio(%)")("スライダー").valueAtTime(time-inPoint); \n' +
          "if (trim_ratio > 100) { \n" +
          "\t opacity = 100;\n" +
          "} else { \n" +
          "\t	opacity = 0;\n" +
          "}";
      } catch (e) {}

      //  Main Commands end
      // ******************************************

      l.selected = false;
    }

    app.endUndoGroup();
  }

  // main code:
  TypoExpressionTrim_doIt();
})(this);
