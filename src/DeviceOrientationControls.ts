/*/ /*/ /*/ /* The MIT License */ /*/ /*/ /*/

https://github.com/mrdoob/three.js

Copyright © 2010-2018 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

/*/                  /*/                  /*/
import { Matrix } from "./lib/common/matrix-vector";
// File:src/math/Vector3.js
/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */
export class Vector3 {
  x: number; y: number; z: number
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// File:src/math/Euler.js
/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */
export class Euler {
  RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];
  DefaultOrder = 'XYZ';
  _x: number; _y: number; _z: number; _order: string;
  onChangeCallback = () => void 0;
  get order() { return this._order; }
  set order(value) {
    this._order = value;
    this.onChangeCallback();
  }
  constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
  }
  set(x: number, y: number, z: number, order: string) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || this._order;
    this.onChangeCallback();
    return this;
  }
  setFromQuaternion(q: Quaternion, order: string, update = true) {
    var clamp = (x: number, a: number, b: number) => (x < a) ? a : ((x > b) ? b : x);
    // q is assumed to be normalized
    // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
    var sqx = q._x * q._x;
    var sqy = q._y * q._y;
    var sqz = q._z * q._z;
    var sqw = q._w * q._w;
    order = order || this._order;
    if (order === 'XYZ') {
      this._x = Math.atan2(2 * (q._x * q._w - q._y * q._z), (sqw - sqx - sqy + sqz));
      this._y = Math.asin(clamp(2 * (q._x * q._z + q._y * q._w), - 1, 1));
      this._z = Math.atan2(2 * (q._z * q._w - q._x * q._y), (sqw + sqx - sqy - sqz));
    } else if (order === 'YXZ') {
      this._x = Math.asin(clamp(2 * (q._x * q._w - q._y * q._z), - 1, 1));
      this._y = Math.atan2(2 * (q._x * q._z + q._y * q._w), (sqw - sqx - sqy + sqz));
      this._z = Math.atan2(2 * (q._x * q._y + q._z * q._w), (sqw - sqx + sqy - sqz));
    } else if (order === 'ZXY') {
      this._x = Math.asin(clamp(2 * (q._x * q._w + q._y * q._z), - 1, 1));
      this._y = Math.atan2(2 * (q._y * q._w - q._z * q._x), (sqw - sqx - sqy + sqz));
      this._z = Math.atan2(2 * (q._z * q._w - q._x * q._y), (sqw - sqx + sqy - sqz));
    } else if (order === 'ZYX') {
      this._x = Math.atan2(2 * (q._x * q._w + q._z * q._y), (sqw - sqx - sqy + sqz));
      this._y = Math.asin(clamp(2 * (q._y * q._w - q._x * q._z), - 1, 1));
      this._z = Math.atan2(2 * (q._x * q._y + q._z * q._w), (sqw + sqx - sqy - sqz));
    } else if (order === 'YZX') {
      this._x = Math.atan2(2 * (q._x * q._w - q._z * q._y), (sqw - sqx + sqy - sqz));
      this._y = Math.atan2(2 * (q._y * q._w - q._x * q._z), (sqw + sqx - sqy - sqz));
      this._z = Math.asin(clamp(2 * (q._x * q._y + q._z * q._w), - 1, 1));
    } else if (order === 'XZY') {
      this._x = Math.atan2(2 * (q._x * q._w + q._y * q._z), (sqw - sqx + sqy - sqz));
      this._y = Math.atan2(2 * (q._x * q._z + q._y * q._w), (sqw + sqx - sqy - sqz));
      this._z = Math.asin(clamp(2 * (q._z * q._w - q._x * q._y), - 1, 1));
    } else {
      console.warn('THREE.Euler: .setFromQuaternion() given unsupported order: ' + order)
    }
    this._order = order;
    if (update !== false) this.onChangeCallback();
    return this;
  }
  reorder(newOrder) {
    // WARNING: this discards revolution information -bhouston
    var q = new Quaternion();
    q.setFromEuler(this);
    this.setFromQuaternion(q, newOrder);
  }
}

// File:src/math/Quaternion.js
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */
export class Quaternion {
  _x: number;
  _y: number;
  _z: number;
  _w: number;
  onChangeCallback = () => void 0;
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
  };
  setFromEuler(euler: Euler, update: boolean = false) {
    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    var c1 = Math.cos(euler._x / 2);
    var c2 = Math.cos(euler._y / 2);
    var c3 = Math.cos(euler._z / 2);
    var s1 = Math.sin(euler._x / 2);
    var s2 = Math.sin(euler._y / 2);
    var s3 = Math.sin(euler._z / 2);

    if (euler.order === 'XYZ') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (euler.order === 'YXZ') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (euler.order === 'ZXY') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (euler.order === 'ZYX') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (euler.order === 'YZX') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (euler.order === 'XZY') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    }
    if (update !== false) this.onChangeCallback();
    return this;
  }
  multiply(q: Quaternion, p?: Quaternion) {
    if (p !== undefined) {
      console.warn('Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
      return this.multiplyQuaternions(q, p);
    }
    return this.multiplyQuaternions(this, q);
  }
  multiplyQuaternions(a: Quaternion, b: Quaternion) {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
    var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
    var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    this.onChangeCallback();
    return this;
  }
  setFromAxisAngle(axis: Vector3, angle: number) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
    // assumes axis is normalized
    var halfAngle = angle / 2, s = Math.sin(halfAngle);
    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos(halfAngle);
    this.onChangeCallback();
    return this;
  }
  // File:src/math/Matrix4.js / makeRotationFromQuaternion
  /**
   * @author mrdoob / http://mrdoob.com/
   * @author supereggbert / http://www.paulbrunt.co.uk/
   * @author philogb / http://blog.thejit.org/
   * @author jordi_ros / http://plattsoft.com
   * @author D1plo1d / http://github.com/D1plo1d
   * @author alteredq / http://alteredqualia.com/
   * @author mikael emtinger / http://gomo.se/
   * @author timknip / http://www.floorplanner.com/
   * @author bhouston / http://exocortex.com
   * @author WestLangley / http://github.com/WestLangley
   */
  makeRotationMatrix() {
    var q = this;
    var te: number[] = new Array(16);
    var x = q._x, y = q._y, z = q._z, w = q._w;
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;

    te[0] = 1 - (yy + zz);
    te[4] = xy - wz;
    te[8] = xz + wy;

    te[1] = xy + wz;
    te[5] = 1 - (xx + zz);
    te[9] = yz - wx;

    te[2] = xz - wy;
    te[6] = yz + wx;
    te[10] = 1 - (xx + yy);

    // last column
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    // bottom row
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return new Matrix(4, te);

  }
}

// File:src/math/Math.js
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
var degToRad = (() => {
  var degreeToRadiansFactor = Math.PI / 180;
  return deg => deg * degreeToRadiansFactor;
})();

// File:examples/js/controls/DeviceOrientationControls.js
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */
export function deviceOrientationControl(object: { rotation: Euler, quaternion: Quaternion }) {
  object.rotation.reorder('YXZ');
  object.rotation.onChangeCallback = () => void object.quaternion.setFromEuler(object.rotation, false);
  object.quaternion.onChangeCallback = () => void object.rotation.setFromQuaternion(object.quaternion, object.rotation.order, false);
  var deviceOrientation: any = {};
  var screenOrientation = 0;
  var alphaOffset = 0; // radians

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
  var setObjectQuaternion = (() => {
    var zee = new Vector3(0, 0, 1);
    var euler = new Euler();
    var q0 = new Quaternion();
    var q1 = new Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
    return function (quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
      quaternion.setFromEuler(euler); // orient the device
      quaternion.multiply(q1); // camera looks out the back of the device, not the top
      quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation
      return quaternion;
    };
  })();

  var onScreenOrientationChangeEvent;
  window.addEventListener('orientationchange', onScreenOrientationChangeEvent = () => screenOrientation = (() => {
    // @ts-ignore
    switch (window.screen.orientation || window.screen.mozOrientation) {
      case 'landscape-primary':
        return 90;
      case 'landscape-secondary':
        return -90;
      case 'portrait-secondary':
        return 180;
      case 'portrait-primary':
        return 0;
    }
    // this returns 90 if width is greater then height
    // and window orientation is undefined OR 0
    // if (!window.orientation && window.innerWidth > window.innerHeight)
    //   return 90;
    if (typeof window.orientation == "string") return 0;
    return window.orientation || 0;
  })(), false);
  onScreenOrientationChangeEvent(); // run once on load
  window.addEventListener('deviceorientation', e => deviceOrientation = e, false);

  return function update() {
    var device = deviceOrientation;
    if (device) {
      var alpha = device.alpha ? degToRad(device.alpha) + alphaOffset : 0; // Z
      var beta = device.beta ? degToRad(device.beta) : 0; // X'
      var gamma = device.gamma ? degToRad(device.gamma) : 0; // Y''
      var orient = screenOrientation ? degToRad(screenOrientation) : 0; // O
      setObjectQuaternion(object.quaternion, alpha, beta, gamma, orient);
    }
  };
};