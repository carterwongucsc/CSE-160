class Sphere {
  constructor(segments) {
    this.matrix = new Matrix4();
    this.color = [1, 1, 1, 1];
    this.textureNum = -1;
    this.segments = segments || 24;
  }

  static init(gl, segments) {
    segments = segments || 24;
    if (Sphere.vertexBuffer && Sphere.segments === segments) return;
    var data = [];
    function addVertex(theta, phi) {
      var sinTheta = Math.sin(theta);
      var x = sinTheta * Math.cos(phi);
      var y = Math.cos(theta);
      var z = sinTheta * Math.sin(phi);
      var u = phi / (Math.PI * 2);
      var v = theta / Math.PI;
      data.push(x, y, z, u, v, x, y, z);
    }
    for (var lat = 0; lat < segments; lat++) {
      var t1 = lat * Math.PI / segments;
      var t2 = (lat + 1) * Math.PI / segments;
      for (var lon = 0; lon < segments; lon++) {
        var p1 = lon * 2 * Math.PI / segments;
        var p2 = (lon + 1) * 2 * Math.PI / segments;
        addVertex(t1, p1); addVertex(t2, p1); addVertex(t2, p2);
        addVertex(t1, p1); addVertex(t2, p2); addVertex(t1, p2);
      }
    }
    Sphere.vertexBuffer = gl.createBuffer();
    Sphere.vertexCount = data.length / 8;
    Sphere.segments = segments;
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  static bind(gl, uniforms) {
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.vertexBuffer);
    var FSIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(uniforms.a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);
    gl.vertexAttribPointer(uniforms.a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(uniforms.a_UV);
    gl.vertexAttribPointer(uniforms.a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
    gl.enableVertexAttribArray(uniforms.a_Normal);
  }

  render(gl, uniforms) {
    Sphere.bind(gl, uniforms);
    setObjectUniforms(gl, uniforms, this.matrix, this.color, this.textureNum);
    gl.drawArrays(gl.TRIANGLES, 0, Sphere.vertexCount);
  }
}
