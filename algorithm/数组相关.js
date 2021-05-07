/**
 * 两数之和
 * https://leetcode-cn.com/problems/two-sum/
 */

var twoSum = function(nums, target) {
    const map = new Map()
    const res = []
    const len = nums.length
    for(let i = 0; i < len; i++) {
        const diff = target - nums[i]
        if(map.has(diff)) {
            return [i, map.get(diff)]
        }
        map.set(nums[i], i)
    }
}


/**
 * 三数之和
 * https://leetcode-cn.com/problems/3sum/
 * 使用双指针，排序
 */

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
 var threeSum = function(nums) {
    const res = []
    if(!nums || nums.length < 2) {
        return res
    }
    nums.sort((a, b) => a- b)  //排序之后才能双指针
    const len = nums.length
    for(let i = 0; i < len - 2; i ++ ) {
        let b = i + 1
        let l = len - 1
        if(nums[i] > 0) {    //直接结束循环
            break;
        }
        if(i > 0 && nums[i] === nums[i - 1]) {  //去重
            continue;
        }
        while(l > b) {
            if(nums[i] + nums[b] + nums[l] > 0) {
                l --
            }else if(nums[i] + nums[b] + nums[l] < 0) {
                b ++
            }else {
                res.push([nums[i] , nums[b], nums[l]])
                while(b < l && nums[b] == nums[b + 1]) {  //去重
                    b ++
                }
                while(b < l && nums[l] == nums[l - 1]) {  //去重
                    l --
                }
                b ++
                l --
            }
            
        }
    }
    return res
};