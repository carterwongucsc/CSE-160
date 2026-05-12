class Cube {
  constructor() {
    this.matrix = new Matrix4();
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.textureNum = -1;
  }

  static init(gl, a_Position, a_UV) {
    if (Cube.vertexBuffer) return;

    var vertices = new Float32Array([
      // x, y, z, u, v
      // Front
      0,0,1, 0,0,   1,0,1, 1,0,   1,1,1, 1,1,
      0,0,1, 0,0,   1,1,1, 1,1,   0,1,1, 0,1,
      // Back
      1,0,0, 0,0,   0,0,0, 1,0,   0,1,0, 1,1,
      1,0,0, 0,0,   0,1,0, 1,1,   1,1,0, 0,1,
      // Left
      0,0,0, 0,0,   0,0,1, 1,0,   0,1,1, 1,1,
      0,0,0, 0,0,   0,1,1, 1,1,   0,1,0, 0,1,
      // Right
      1,0,1, 0,0,   1,0,0, 1,0,   1,1,0, 1,1,
      1,0,1, 0,0,   1,1,0, 1,1,   1,1,1, 0,1,
      // Top
      0,1,1, 0,0,   1,1,1, 1,0,   1,1,0, 1,1,
      0,1,1, 0,0,   1,1,0, 1,1,   0,1,0, 0,1,
      // Bottom
      0,0,0, 0,0,   1,0,0, 1,0,   1,0,1, 1,1,
      0,0,0, 0,0,   1,0,1, 1,1,   0,0,1, 0,1
    ]);

    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(a_UV);
  }

  render(gl, uniforms) {
    gl.uniformMatrix4fv(uniforms.u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(uniforms.u_BaseColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(uniforms.u_TexWeight, this.textureNum >= 0 ? 1.0 : 0.0);
    gl.uniform1i(uniforms.u_WhichTexture, Math.max(0, this.textureNum));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}
