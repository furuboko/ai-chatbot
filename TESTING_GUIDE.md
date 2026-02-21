# Testing Guide - Multimodal AI Chatbot

## 📋 Manual Testing Checklist

### 1. Image Upload Tests

#### Test 1.1: Single Image Upload (PNG)
**Steps:**
1. Open the chatbot interface
2. Click the file picker or drag & drop a PNG image
3. Verify image preview appears
4. Add message: "What's in this image?"
5. Click Send

**Expected:**
- ✅ Image preview shows before sending
- ✅ Image uploads successfully
- ✅ Message sent with image
- ✅ Claude responds analyzing the image
- ✅ Image displays as thumbnail in chat history
- ✅ Click thumbnail to view full-screen

**Test Files:**
- `test-image.png` (< 1MB)

---

#### Test 1.2: Multiple Image Upload
**Steps:**
1. Select/drag & drop 3 images (JPEG, PNG, GIF)
2. Verify all 3 previews appear
3. Send without text message (images only)

**Expected:**
- ✅ All 3 images show in preview
- ✅ Can remove individual images before sending
- ✅ Send button enabled with images only
- ✅ All images display in chat history
- ✅ Claude responds to all images

---

#### Test 1.3: Image Count Limit (5 max)
**Steps:**
1. Attempt to upload 6 images

**Expected:**
- ❌ Error message: "画像は最大5枚まで添付できます"
- ✅ Only first 5 images accepted

---

#### Test 1.4: Image Size Limit (5MB)
**Steps:**
1. Upload a large image (> 5MB original, but compressed)
2. Verify compression works

**Expected:**
- ✅ Image compressed to < 5MB automatically
- ✅ Upload succeeds after compression
- ✅ Image quality acceptable (85%)

---

#### Test 1.5: Upload 6MB image (should fail after compression limit)
**Steps:**
1. Create/upload extremely large image that won't compress to < 5MB

**Expected:**
- ❌ Error message: "画像サイズは5MB以下にしてください"

---

#### Test 1.6: Invalid File Type
**Steps:**
1. Attempt to upload .txt, .pdf, .mp4 file

**Expected:**
- ❌ Error message: "JPG、PNG、GIF、WebP形式の画像のみ対応しています"
- ✅ File not added to preview

---

#### Test 1.7: File Type Spoofing
**Steps:**
1. Rename `malicious.html` to `malicious.jpg`
2. Attempt to upload

**Expected:**
- ❌ Rejected by server (magic number mismatch)
- ✅ Error message displayed

---

### 2. Text-Only Tests (Backward Compatibility)

#### Test 2.1: Text Message Only
**Steps:**
1. Type message without images
2. Send

**Expected:**
- ✅ Works as before (backward compatible)
- ✅ No image-related UI shown
- ✅ Claude responds normally

---

#### Test 2.2: Empty Message with No Images
**Steps:**
1. Click Send without text or images

**Expected:**
- ❌ Error: "メッセージまたは画像を追加してください"
- ✅ Message not sent

---

### 3. Mixed Content Tests

#### Test 3.1: Text + Images
**Steps:**
1. Type message: "Describe these images"
2. Upload 2 images
3. Send

**Expected:**
- ✅ Both text and images sent
- ✅ Claude responds to both text and images
- ✅ Display correctly in chat history

---

### 4. UI/UX Tests

#### Test 4.1: Drag & Drop
**Steps:**
1. Drag image file over upload zone
2. Verify visual feedback (border highlight)
3. Drop image

**Expected:**
- ✅ Upload zone highlights on dragover
- ✅ Image preview appears after drop
- ✅ Smooth animation

---

#### Test 4.2: Image Preview & Remove
**Steps:**
1. Upload 3 images
2. Hover over preview thumbnails
3. Click X button to remove middle image
4. Verify only 2 images remain

**Expected:**
- ✅ Hover shows remove button
- ✅ Remove button works
- ✅ Correct image removed

---

#### Test 4.3: Full-Screen Image Modal
**Steps:**
1. Send message with image
2. Click image thumbnail in chat history
3. Press ESC key

**Expected:**
- ✅ Modal opens showing full-size image
- ✅ Filename displayed at bottom
- ✅ ESC key closes modal
- ✅ Click outside closes modal
- ✅ Body scroll prevented when modal open

---

#### Test 4.4: Loading States
**Steps:**
1. Upload 5 large images
2. Observe loading indicator
3. Send message
4. Observe sending state

**Expected:**
- ✅ "画像を処理中..." shown during compression
- ✅ "送信中..." shown during send
- ✅ Input disabled during processing
- ✅ Bouncing dots while Claude responds

---

### 5. Conversation Flow Tests

#### Test 5.1: Conversation Persistence
**Steps:**
1. Send message with images
2. Refresh browser page
3. Verify chat history

**Expected:**
- ✅ All messages (including images) persist
- ✅ Images display correctly after reload
- ✅ Scroll to bottom on load

---

#### Test 5.2: Reset Conversation
**Steps:**
1. Send several messages with images
2. Click Reset button
3. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ All messages deleted
- ✅ All images deleted
- ✅ Empty state shown

---

### 6. Error Handling Tests

#### Test 6.1: Network Error
**Steps:**
1. Disable network
2. Attempt to send message with image

**Expected:**
- ❌ Error message displayed
- ✅ Can retry after reconnecting

---

#### Test 6.2: Rate Limiting
**Steps:**
1. Send 10 messages rapidly (within 1 minute)

**Expected:**
- ❌ 11th request blocked
- ✅ Error: "Too many requests. Please try again later."
- ✅ X-RateLimit headers in response

---

### 7. Mobile Responsive Tests

#### Test 7.1: Mobile Upload
**Device:** Smartphone (iOS/Android)

**Steps:**
1. Open chatbot on mobile
2. Tap file picker
3. Select image from camera roll
4. Send

**Expected:**
- ✅ File picker opens mobile photo library
- ✅ Image preview displays correctly
- ✅ Touch targets ≥ 44px
- ✅ Responsive layout (no horizontal scroll)

---

#### Test 7.2: Mobile Modal
**Steps:**
1. Click image thumbnail on mobile
2. View full-screen modal

**Expected:**
- ✅ Modal fills screen
- ✅ Image scales correctly
- ✅ Close button accessible
- ✅ Tap outside closes modal

---

### 8. Performance Tests

#### Test 8.1: Large Conversation
**Steps:**
1. Load conversation with 50 messages (including images)
2. Scroll through history
3. Measure render time

**Expected:**
- ✅ Renders in < 2 seconds
- ✅ Smooth scrolling
- ✅ No lag or jank

---

#### Test 8.2: Upload Speed
**Steps:**
1. Upload 5 images (5MB each)
2. Measure time to compress and upload

**Expected:**
- ✅ Completes in < 10 seconds
- ✅ Progress feedback shown

---

### 9. Security Tests (see SECURITY_CHECKLIST.md)

---

## 🧪 Automated Testing (Future)

### Unit Tests
```bash
# Run unit tests (when implemented)
npm test

# Tests to implement:
# - message-parser.test.ts
# - image-validation.test.ts
# - security.test.ts
```

### Integration Tests
```bash
# API endpoint tests (when implemented)
npm run test:integration

# Tests to implement:
# - POST /api/chat with images
# - POST /api/chat text only
# - GET /api/messages with images
# - POST /api/reset
```

---

## 📊 Test Results Template

### Test Session Information
- **Date:** YYYY-MM-DD
- **Tester:** Name
- **Environment:** Development / Staging / Production
- **Browser:** Chrome 120, Firefox 121, Safari 17
- **Device:** Desktop / Mobile

### Results Summary
| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Image Upload | X/7 | X/7 | - |
| Text-Only | X/2 | X/2 | - |
| Mixed Content | X/1 | X/1 | - |
| UI/UX | X/4 | X/4 | - |
| Conversation | X/2 | X/2 | - |
| Error Handling | X/2 | X/2 | - |
| Mobile | X/2 | X/2 | - |
| Performance | X/2 | X/2 | - |

### Issues Found
1. **Issue Title** - Description, Steps to reproduce, Expected vs Actual

---

## 🚀 Pre-Deployment Checklist

Before deploying to production:

- [ ] All manual tests pass
- [ ] Security checklist complete
- [ ] Performance benchmarks met
- [ ] Mobile testing complete
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] CLAUDE.md reflects all features
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] API keys rotated and secured

---

**Last Updated**: 2026-02-21
**Version**: 1.0.0
