(function addVectorHelpers() {
  if (!Vector3.prototype.set) {
    Vector3.prototype.set = function(src) {
      var s = src.elements || src;
      this.elements[0] = s[0];
      this.elements[1] = s[1];
      this.elements[2] = s[2];
      return this;
    };
  }
  if (!Vector3.prototype.add) {
    Vector3.prototype.add = function(other) {
      var a = this.elements;
      var b = other.elements || other;
      a[0] += b[0];
      a[1] += b[1];
      a[2] += b[2];
      return this;
    };
  }
  if (!Vector3.prototype.sub) {
    Vector3.prototype.sub = function(other) {
      var a = this.elements;
      var b = other.elements || other;
      a[0] -= b[0];
      a[1] -= b[1];
      a[2] -= b[2];
      return this;
    };
  }
  if (!Vector3.prototype.mul) {
    Vector3.prototype.mul = function(scalar) {
      this.elements[0] *= scalar;
      this.elements[1] *= scalar;
      this.elements[2] *= scalar;
      return this;
    };
  }
  if (!Vector3.cross) {
    Vector3.cross = function(a, b) {
      var ae = a.elements || a;
      var be = b.elements || b;
      return new Vector3([
        ae[1] * be[2] - ae[2] * be[1],
        ae[2] * be[0] - ae[0] * be[2],
        ae[0] * be[1] - ae[1] * be[0]
      ]);
    };
  }
})();

class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.fov = 60.0;
    this.eye = new Vector3([16, 2.2, 28]);
    this.at = new Vector3([16, 2.2, 20]);
    this.up = new Vector3([0, 1, 0]);
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.moveSpeed = 0.25;
    this.turnSpeed = 3.0;
    this.updateMatrices();
  }

  updateMatrices() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
    this.projectionMatrix.setPerspective(
      this.fov,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
  }

  forwardVector() {
    return new Vector3(this.at.elements).sub(this.eye).normalize();
  }

  moveForward(speed = this.moveSpeed) {
    var f = this.forwardVector().mul(speed);
    this.eye.add(f);
    this.at.add(f);
  }

  moveBackwards(speed = this.moveSpeed) {
    var b = new Vector3(this.eye.elements).sub(this.at).normalize().mul(speed);
    this.eye.add(b);
    this.at.add(b);
  }

  moveLeft(speed = this.moveSpeed) {
    var f = new Vector3(this.at.elements).sub(this.eye);
    var s = Vector3.cross(this.up, f).normalize().mul(speed);
    this.eye.add(s);
    this.at.add(s);
  }

  moveRight(speed = this.moveSpeed) {
    var f = new Vector3(this.at.elements).sub(this.eye);
    var s = Vector3.cross(f, this.up).normalize().mul(speed);
    this.eye.add(s);
    this.at.add(s);
  }

  panLeft(alpha = this.turnSpeed) {
    var f = new Vector3(this.at.elements).sub(this.eye);
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var fPrime = rotationMatrix.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements).add(fPrime);
  }

  panRight(alpha = this.turnSpeed) {
    this.panLeft(-alpha);
  }
}
