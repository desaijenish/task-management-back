exports.emitCardUpdate = (io, data) => {
  try {
    if (!io || !data?.boardId) {
      throw new Error('Socket.io instance or boardId missing');
    }

    const { boardId, ...updateData } = data;
    

    io.to(boardId.toString()).emit('card-updated', {
      ...updateData,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔔 Emitted card update to board ${boardId}`);
  } catch (error) {
    console.error('❌ Failed to emit card update:', error);
  }
};

exports.emitBoardUpdate = (io, boardId, updateData) => {
  try {
    if (!io || !boardId) {
      throw new Error('Socket.io instance or boardId missing');
    }
    
    io.to(boardId.toString()).emit('board-update', {
      ...updateData,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔔 Emitted board update to board ${boardId}`);
  } catch (error) {
    console.error('❌ Failed to emit board update:', error);
  }
};