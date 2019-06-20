<template>
     <div class="row">
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="image_a" style="height: 150px">
                    <img class="card-img-top img-account" src="../assets/free_account.jpg" alt="">
                </div>
                <div class="card-body">
                    <h4 class="card-title">
                        <a href="#">Basic</a>
                    </h4>
                    <p class="card-text">
                        <ul>
                            <li>Write code in C/C++ language - Editor</li>
                            <li>Read programming problems</li>
                            <li>Resolve online problems</li>
                        </ul>
                    </p>
                </div>
                <h5><b>Free</b></h5>
                <div class="card-footer">
                    <small class="text-muted">&#9733; &#9733; &#9733; &#9734; &#9734;</small>
                </div>
            </div>
        </div>

        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="image_a" style="height: 150px">
                    <img class="card-img-top img-account" src="../assets/lvl12_paid_account.jpg" alt="">
                </div>
                <div class="card-body">
                <h4 class="card-title">
                    <a href="#">Advanced</a>
                </h4>
                <p class="card-text">
                    <ul>
                        <li>Write code in C/C++ language - Editor</li>
                        <li>Read programming problems</li>
                        <li>Resolve online problems</li>
                        <li>Get daily problem</li>
                        <li>Debug option online</li>
                        <li>Automated verification of the code online</li>
                    </ul>
                </p>
                </div>
                <h5><b>$2.99</b></h5>
                <a :href="payment_url" class="btn btn-primary">
                    <span class="glyphicon glyphicon-saved"></span> Buy
                </a>
                <div class="card-footer">
                <small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9734;</small>
                </div>
            </div>
        </div>

        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="image_a" style="height: 150px">
                    <img class="card-img-top img-account" src="../assets/lvl2_paid_account.jpg" alt="">
                </div>
                <div class="card-body">
                <h4 class="card-title">
                    <a href="#">Premium</a>
                </h4>
                <p class="card-text">
                    <ul>
                        <li>Write code in C/C++ language - Editor</li>
                        <li>Read programming problems</li>
                        <li>Resolve online problems</li>
                        <li>Get daily problem</li>
                        <li>Debug option online</li>
                        <li>Automated verification of the code online</li>
                        <li>Get recommended problems based on progress</li>
                        <li>Follow a friend while he's coding</li>
                    </ul>
                </p>
                </div>
                <h5><b>$4.99</b></h5>
                <div class="card-footer">
                <small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9733;</small>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "UpdateAccount",
  data () {
    return {
      payment_url: ''
    }
  },
  async mounted () {
    let loading = this.$loading.show()
    try {
        let result = await this.$api.paypal.pay()
        if (result.ok) {
            this.payment_url = result.result
            console.warn(this.payment_url)
        } else {
            console.warn(result.error)
        }
    } catch (e) {
        console.warn(e)
    } finally {
        loading.hide()
    }
  }
}
</script>

<style>
.img-account {
    width: 30%;
    height: 90%;
    margin-top: 20px;
}
.imgage_a {
    height: 150px !important;
    display: block;
}
</style>
