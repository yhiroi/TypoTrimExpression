(function TypoExpressionTransform(thisObj) {
  // TypoExpressionTransform
  // 文字シェイプに、パスのトリミング及びトランスフォーム属性を追加し、
  // 対応するエクスプレッションを記述する
  // (c) eau. / La Mer Artworks 2020
  // http://lamer-e.tv

  // Globals
  var TypoExpressionTransformData = new Object();
  TypoExpressionTransformData.scriptName = "TypoExpressionWithTransform";

  function TypoExpressionTransform_doIt() {
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

    app.beginUndoGroup(TypoExpressionTransformData.scriptName);

    //  Main Commands Start
    // ******************************************

    // 現在のコンポにControllerがない場合、作成する
    // - コンポから目的とするControllerの名前を検索し、フラグを立てる
    var isPartsCtlIn = false;
    for (var i = 1; i < comp.numLayers; i++) {
      var name = comp.layer(i).name;
      if (name.indexOf("LettersController") > -1) isLettersCtlIn = true;
    }

    // パーツレベルコントローラ(PartsController)が存在しない場合、作成する
    if (!isPartsCtlIn) {
      var partsCtl = comp.layers.addNull();
      partsCtl.name = "PartsController";
      // partsCtl.threeDLayer = true;
      partsCtl.collapseTransformation = true;

      // エクスプレッションに紐付けるスライダーをコントローラに追加する
      // - 不透明度
      var opacityRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      opacityRatio.name = "Opacity";
      opacityRatio["スライダー"].setValue(100);

      // - x位置:イージング
      var pxRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      pxRatio.name = "PositionX_ratio(%)";
      pxRatio["スライダー"].setValue(100);

      // - x位置:最大距離
      var pxDistMax = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      pxDistMax.name = "PositionX_maxDist";
      pxDistMax["スライダー"].setValue(30);

      // - y位置:イージング
      var pyRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      pyRatio.name = "PositionY_ratio(%)";
      pyRatio["スライダー"].setValue(100);

      // - y位置:最大距離
      var pyDistMax = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      pyDistMax.name = "PositionY_maxDist";
      pyDistMax["スライダー"].setValue(30);

      // - 回転:イージング
      var rotRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      rotRatio.name = "Rotation_ratio(%)";
      rotRatio["スライダー"].setValue(100);

      // - 回転:最大回転角
      var rotMax = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      rotMax.name = "Rotation_maxRot";
      rotMax["スライダー"].setValue(20);

      // - パスのトリミング:イージング
      var trimRatio = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      trimRatio.name = "Trim_ratio(%)";
      trimRatio["スライダー"].setValue(100);

      // - 全パラメータのランダムシード
      var randSeeds = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Slider Control");
      randSeeds.name = "Random_seed";
      randSeeds["スライダー"].setValue(1);

      // - 全パラメータのランダムタイプ
      //   オフで1方向、オンで双方向
      var randDirection = partsCtl
        .property("ADBE Effect Parade")
        .addProperty("ADBE Checkbox Control");
      randDirection.name = "Random_Direction(Off:UniDir_On:BiDir)";
      randDirection["チェックボックス"].setValue(0);

      // コンポの先頭にレイヤーを移動
      partsCtl.moveToBeginning();
    }

    // 選択レイヤー（パーツ）を1つずつ処理する
    for (var i = 0; i < selLayers.length; i++) {
      var l = selLayers[i];
      l.selected = true;
      l.threeDLayer = true;

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

        // トランスフォーム
        // - 位置
        // - エクスプレッションの内容は過去のLTを参照
        l.transform.position.expression =
          'var rdsd = Math.abs( Math.floor( thisComp.layer("PartsController").effect("Random_seed")("スライダー") ) ); \n' +
          "seedRandom(rdsd, true); \n" +
          'var maxdist_x = thisComp.layer("PartsController").effect("PositionX_maxDist")("スライダー"); \n' +
          'var maxdist_y = thisComp.layer("PartsController").effect("PositionY_maxDist")("スライダー"); \n' +
          'var mindist_x = maxdist_x / 2.; \n' +
          'if (thisComp.layer("PartsController").effect("Random_Direction(Off:UniDir_On:BiDir)")("チェックボックス")==1) { \n' +
          "mindist_x = -mindist_x } \n" +
          'var mindist_y = maxdist_y / 2.; \n' +
          'if (thisComp.layer("PartsController").effect("Random_Direction(Off:UniDir_On:BiDir)")("チェックボックス")==1) { \n' +
          "mindist_y = -mindist_y } \n" +
          "var dist_x = random(mindist_x, maxdist_x); \n" +
          "var dist_y = random(mindist_y, maxdist_y); \n" +
          'var ratio_x = (100. - thisComp.layer("PartsController").effect("PositionX_ratio(%)")("スライダー").valueAtTime(time-inPoint)) / 100.; \n' +
          'var ratio_y = (100. - thisComp.layer("PartsController").effect("PositionY_ratio(%)")("スライダー").valueAtTime(time-inPoint)) / 100.; \n' +
          "transform.position = transform.position + [dist_x * ratio_x, dist_y * ratio_y, 0];";

        // // - x回転
        // l.transform.xRotation.expression =
        //   'var rdsd = Math.abs( Math.floor( thisComp.layer("PartsController").effect("Random_seed")("スライダー") ) ); \n' +
        //   "seedRandom(rdsd, true); \n" +
        //   'var maxrot = thisComp.layer("PartsController").effect("Rotation_maxRot")("スライダー"); \n' +
        //   'var ratio_rot = (100. - thisComp.layer("PartsController").effect("Rotation_ratio(%)")("スライダー").valueAtTime(time-inPoint)) / 100.; \n' +
        //   "var rot_x = random(-maxrot, maxrot); \n" +
        //   "transform.xRotation = transform.xRotation + rot_x * ratio_rot;";

        // // - y回転
        // l.transform.yRotation.expression =
        //   'var rdsd = Math.abs( Math.floor( thisComp.layer("PartsController").effect("Random_seed")("スライダー") ) ); \n' +
        //   "seedRandom(rdsd, true); \n" +
        //   'var maxrot = thisComp.layer("PartsController").effect("Rotation_maxRot")("スライダー"); \n' +
        //   'var ratio_rot = (100. - thisComp.layer("PartsController").effect("Rotation_ratio(%)")("スライダー").valueAtTime(time-inPoint)) / 100.; \n' +
        //   "var rot_y = random(-maxrot, maxrot); \n" +
        //   "transform.yRotation = transform.xRotation + rot_y * ratio_rot;";

        // - z回転
        l.transform.zRotation.expression =
          'var rdsd = Math.abs( Math.floor( thisComp.layer("PartsController").effect("Random_seed")("スライダー") ) ); \n' +
          "seedRandom(rdsd, true); \n" +
          'var maxrot = thisComp.layer("PartsController").effect("Rotation_maxRot")("スライダー"); \n' +
          'var ratio_rot = (100. - thisComp.layer("PartsController").effect("Rotation_ratio(%)")("スライダー").valueAtTime(time-inPoint)) / 100.; \n' +
          "var rot_z = random(-maxrot, maxrot); \n" +
          "transform.zRotation = transform.xRotation + rot_z * ratio_rot;";

        // - 不透明度
        l.transform.opacity.expression =
          "seedRandom(1, true); \n" +
          'transform.opacity = thisComp.layer("PartsController").effect("Opacity")("スライダー").valueAtTime(time-inPoint);';

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
  TypoExpressionTransform_doIt();
})(this);
