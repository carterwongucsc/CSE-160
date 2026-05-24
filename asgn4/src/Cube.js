class Cube {
  constructor() {
    this.matrix = new Matrix4();
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.textureNum = -1;
  }

  static init(gl) {
    if (Cube.vertexBuffer) return;
    var data = [];
    function face(verts, normal) {
      var uvs = [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]];
      for (var i = 0; i < 6; i++) {
        data.push(verts[i][0], verts[i][1], verts[i][2], uvs[i][0], uvs[i][1], normal[0], normal[1], normal[2]);
      }
    }
    face([[0,0,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1],[0,1,1]], [0,0,1]);
    face([[1,0,0],[0,0,0],[0,1,0],[1,0,0],[0,1,0],[1,1,0]], [0,0,-1]);
    face([[0,0,0],[0,0,1],[0,1,1],[0,0,0],[0,1,1],[0,1,0]], [-1,0,0]);
    face([[1,0,1],[1,0,0],[1,1,0],[1,0,1],[1,1,0],[1,1,1]], [1,0,0]);
    face([[0,1,1],[1,1,1],[1,1,0],[0,1,1],[1,1,0],[0,1,0]], [0,1,0]);
    face([[0,0,0],[1,0,0],[1,0,1],[0,0,0],[1,0,1],[0,0,1]], [0,-1,0]);

    Cube.vertexBuffer = gl.createBuffer();
    Cube.vertexCount = 36;
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  static bind(gl, uniforms) {
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    var FSIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(uniforms.a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);
    gl.vertexAttribPointer(uniforms.a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(uniforms.a_UV);
    gl.vertexAttribPointer(uniforms.a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
    gl.enableVertexAttribArray(uniforms.a_Normal);
  }

  render(gl, uniforms) {
    Cube.bind(gl, uniforms);
    setObjectUniforms(gl, uniforms, this.matrix, this.color, this.textureNum);
    gl.drawArrays(gl.TRIANGLES, 0, Cube.vertexCount);
  }
}
