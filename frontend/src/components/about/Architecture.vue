<template>
  <div class="architecture">
    <h3>
      Project Architecture
    </h3>
    <div class="draw">
<iframe frameborder="0" style="width:100%;height:100vh;" src="https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=architecture#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D14bMG-YVHSNU6uFL2nRydU3szVXQUTOON%26export%3Ddownload"></iframe>    </div>
  </div>
</template>

<script>
export default {
  created(){
    let drawio = document.createElement('script');
    drawio.setAttribute('src', "https://www.draw.io/embed2.js?&fetch=https%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D14bMG-YVHSNU6uFL2nRydU3szVXQUTOON%26export%3Ddownload")
    document.head.appendChild(drawio);
  }
}
</script>

<style scoped>
.architecture {

  width: 100%;
}
.draw {
  width: 100%;
  border: 1px solid #aaa;
  margin-bottom: 10px;
}
</style>