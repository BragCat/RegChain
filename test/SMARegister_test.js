const SMARegisterContract = artifacts.require("SMARegister");


contract("SMARegister", accounts => {
    let SMARegister;
    const admin = accounts[0];
    const update_type = 0;
    const asn = 4378;
    const acs_addr = "2402:f000:6:1231::28:24";
    const effect_time = 1588042095;
    const name = "Tsinghua University";
    const applicant = accounts[1];

    describe("deployment", () => {
        beforeEach(async() => {
            SMARegister = await SMARegisterContract.deployed();
        });
        it("has been deployed", async() => {
            assert(SMARegister, "SMARegister was deployed successfully.");
        });
    });

    describe("AS update apply", () => {
        it("AS update apply function check", async() => {
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_length = old_app_queue.length;
            const tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_length = new_app_queue.length;
            assert.equal(new_length - old_length, 1, "Apply failed.");
            assert.equal(new_app_queue[new_length - 1].asn, asn, "AS number should match.");
            const duplicate_tx = await SMARegister.ASUpdate(
                update_type,
                asn,
                acs_addr,
                effect_time,
                {from: applicant}
            );
            const duplicate_new_app_queue = await SMARegister.UpdateQuery();
            const duplicate_new_app_length = duplicate_new_app_queue.length;
            assert.equal(new_length, duplicate_new_app_length, "Same AS can only apply once at a time."); 
        });
        it("ASUpdate function time tester", async() => {
            const tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
        });
        it("UpdateQuery function time tester", async() => {
            const app_queue = await SMARegister.UpdateQuery();
        });
    });

    describe("AS update application review", async() => {
        it("AS update approve function check", async() => {
            var tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_app_cnt = old_app_queue.length;
            tx = await SMARegister.UpdateApprove(
                applicant,
                {from: admin}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_app_cnt = new_app_queue.length;
            assert(old_app_cnt - new_app_cnt, 1, "Application should decrement by 1.");
        });

        it("AS update approve authority check", async() => {
            var tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            try{
                tx = await SMARegister.UpdateApprove(
                    applicant,
                    {from: applicant}
                    );
                assert.fail("UpdateApprove call should fail.");
            } catch(err) {
            }
        });

        it("AS update approve time tester", async() => {
           var tx = await SMARegister.UpdateApprove(
                    applicant,
                    {from: admin}
                    ); 
        });

        it("AS update reject function check", async() => {
            var tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_app_cnt = old_app_queue.length;
            tx = await SMARegister.UpdateReject(
                applicant,
                {from: admin}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_app_cnt = new_app_queue.length;
            assert(old_app_cnt - new_app_cnt, 1, "Application should decrement by 1.");
        });

        it("AS update reject authority check", async() => {
            var tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            try{
                tx = await SMARegister.UpdateReject(
                    applicant,
                    {from: applicant}
                    );
                assert.fail("UpdateApprove call should fail.");
            } catch(err) {
            }
        });

        it("AS update reject time tester", async() => {
           var tx = await SMARegister.UpdateReject(
                    applicant,
                    {from: admin}
                    ); 
        });
    });

    describe("AS query", () => {
        
    });
});
