# TypoTrimExpression

<details><summary>ENG</summary>
AfterEffects scripts for controlling contours and transformations of multiple shape layers.

These scripts add contours and "path trimming" property to each shape layer, and a null layer to control their properties at once on the composition.

</details>
<br>

複数のシェイプレイヤーの輪郭線とトランスフォームを制御するための AfterEffects スクリプトです。

選択したシェイプレイヤーに輪郭線と「パスのトリミング」プロパティを追加し、さらに各プロパティを一括制御するためのヌルレイヤーをコンポジションに追加します。

スクリプトに関する詳細は、以下のスライドをご参照ください。
https://www.slideshare.net/YuichiHiroi/ss-238569968

# Usage

<details><summary>ENG</summary>
Select shape layers to which you would like to apply the script, then apply TypoExpressonTransform.jsx.

After applied the script, a null layer "PartsController" will be added to the composition that contains effects to control each shape layer at once.

Note that, TypoExpressionTrim.jsx is the simplified version of *Transform.jsx and included to describe the code's structure. Thus, *Transform.jsx will be sufficient for actual use.

</details>

<br>

スクリプトを適用したいシェイプレイヤーを選択し、TypoExpressonTransform.jsx を適用します。

適用すると、各シェイプレイヤーを一括制御するためのエクスプレッション制御エフェクトが含まれるヌルレイヤー("PartsController")がコンポジションに追加されます。

注: TypoExpressionTrim.jsx はコードの解説用に付属しており、\*Transform.jsx の機能は、\*Trim.jsx を包含します。実際の使用時には、\*Transform.jsx を使用してください。

# Properties

<details><summary>ENG</summary>
This section describes the properties controlled by the effects in "PartsController".

All sliders are controlled from the inpoints of the shape layers, i.e., if you change the inpoint of each shape layer, you can stagger the start of the motion for each layer.

- Opacity: Control the opacity of each layer.

- PositionX_ratio(%): When 100%, the x-coordinate of each layer will be equal to the original x-coordinate.

  - For example, if you apply the script to text converted from a text layer to a shape layer, at 100%, all parts will be placed to the position where the original text is reproduced.

- PositionX_maxDist: When PositionX_ratio=0%, the maximum displacement of the x-coordinate of each layer is defined.

  - To be exact, when PositionX_ratio=0%, the displacement from the original x-coordinate is determined by random(PositionX_maxDist/2, PositionX_maxDist).

- PositionY_ratio(%): When 100%, the y-coordinate of each layer will be equal to the original y-coordinate.

- PositionY_maxDist: When PositionY_ratio=0%, the maximum displacement of the y-coordinate of each layer is defined.

- Rotation_ratio(%): When 100%, the z-rotation of each layer will be equal to the original z-rotation.

- Rotation_maxRot: When Rotation_ratio=0%, the maximum displacement of the z-rotation of each layer is defined.

- Trim_ratio(%): Determines the end point of the "Path Trimming" property. When the value of this slider is greater than 100, the line and the fill will be switched.

- Random_seed: Change the random seed of all properties.

- Random_Direction: When the check box is OFF, each part comes from one direction (forward) only, and when it is ON, each part comes from both directions.
</details>

<br>

"PartsController"内のエフェクトが制御するプロパティについて詳述します。

すべてのスライダーはシェイプレイヤーのインポイントを起点として制御します。すなわち、各シェイプレイヤーのインポイントを変更すると、レイヤーごとにモーションの開始タイミングをずらしながら制御することができます。

- Opacity: 各レイヤーの不透明度を制御します。

- PositionX_ratio(%): 100%のとき、各レイヤーの x 座標が本来設定された x 座標に等しくなります。

  - 例えば、シェイプ化したテキストに対してスクリプトを適用した場合は、100%のときに全パーツが元のテキストを再現する位置に戻ります。

- PositionX_maxDist: PositionX_ratio=0%としたとき、各パーツの x 座標の最大変位を定義します。

  - 正確には、PositionX_ratio=0%のとき、元の x 座標からの変位が random(PositionX_maxDist/2, PositionX_maxDist)で決定されます。

- PositionY_ratio(%): 100%のとき、各レイヤーの y 座標が本来設定された y 座標に等しくなります。

- PositionY_maxDist: PositionY_ratio=0%としたとき、各パーツの y 座標の最大変位を定義します。

- Rotation_ratio(%): 100%のとき、各レイヤーの z 回転が本来設定された z 回転に等しくなります。

- Rotation_maxRot: Rotation_ratio=0%としたとき、各パーツの z 回転の最大変位を定義します。

- Trim_ratio(%): 「パスのトリミング」プロパティの終了点を決定します。このスライダーの値が 100 を超えると、線と塗りが切り替わります。

- Random_seed: 全プロパティのランダムシードを変更します。

- Random_Direction: チェックボックスが OFF のとき、各パーツが単方向（正方向）のみから移動します。ON のとき、双方向から移動します。
